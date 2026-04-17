"""
Provider adapters — thin wrappers around each LLM provider's HTTP API.

Each adapter exposes:
  validate_key(api_key) -> bool
  complete(api_key, model, messages, max_tokens, temperature) -> str
  stream(api_key, model, messages, max_tokens, temperature) -> AsyncIterator[str]

No provider SDK is installed; all calls go over raw HTTPS so the backend
stays lean and the user's key is never cached.
"""

from __future__ import annotations
import json
import httpx
from abc import ABC, abstractmethod
from typing import AsyncIterator


# ──────────────────────────────────────────────
# Base class
# ──────────────────────────────────────────────

class BaseAdapter(ABC):
    TIMEOUT = httpx.Timeout(60.0)

    @abstractmethod
    async def validate_key(self, api_key: str) -> bool: ...

    @abstractmethod
    async def complete(
        self,
        api_key: str,
        model: str,
        messages: list[dict],
        max_tokens: int,
        temperature: float,
    ) -> str: ...

    @abstractmethod
    async def stream(
        self,
        api_key: str,
        model: str,
        messages: list[dict],
        max_tokens: int,
        temperature: float,
    ) -> AsyncIterator[str]: ...


# ──────────────────────────────────────────────
# Anthropic (Claude)
# ──────────────────────────────────────────────

class ClaudeAdapter(BaseAdapter):
    BASE = "https://api.anthropic.com/v1"
    VERSION = "2023-06-01"

    def _headers(self, api_key: str) -> dict:
        return {
            "x-api-key": api_key,
            "anthropic-version": self.VERSION,
            "content-type": "application/json",
        }

    def _split_messages(self, messages: list[dict]):
        """Anthropic requires system prompt separate from messages array."""
        system = ""
        conv = []
        for m in messages:
            if m["role"] == "system":
                system = m["content"]
            else:
                conv.append(m)
        return system, conv

    async def validate_key(self, api_key: str) -> bool:
        system, _ = self._split_messages([])
        payload = {
            "model": "claude-haiku-4-5",
            "max_tokens": 1,
            "messages": [{"role": "user", "content": "hi"}],
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/messages",
                headers=self._headers(api_key),
                json=payload,
            )
        return r.status_code not in (401, 403)

    async def complete(self, api_key, model, messages, max_tokens, temperature) -> str:
        system, conv = self._split_messages(messages)
        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system,
            "messages": conv,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/messages",
                headers=self._headers(api_key),
                json=payload,
            )
        r.raise_for_status()
        data = r.json()
        return data["content"][0]["text"]

    async def stream(self, api_key, model, messages, max_tokens, temperature) -> AsyncIterator[str]:
        system, conv = self._split_messages(messages)
        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "system": system,
            "messages": conv,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            async with client.stream(
                "POST",
                f"{self.BASE}/messages",
                headers=self._headers(api_key),
                json=payload,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data:"):
                        raw = line[5:].strip()
                        if raw == "[DONE]":
                            break
                        try:
                            event = json.loads(raw)
                            if event.get("type") == "content_block_delta":
                                delta = event.get("delta", {})
                                if delta.get("type") == "text_delta":
                                    yield delta["text"]
                        except json.JSONDecodeError:
                            pass


# ──────────────────────────────────────────────
# OpenAI (ChatGPT)
# ──────────────────────────────────────────────

class OpenAIAdapter(BaseAdapter):
    BASE = "https://api.openai.com/v1"

    def _headers(self, api_key: str) -> dict:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    async def validate_key(self, api_key: str) -> bool:
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.get(
                f"{self.BASE}/models",
                headers=self._headers(api_key),
            )
        return r.status_code not in (401, 403)

    async def complete(self, api_key, model, messages, max_tokens, temperature) -> str:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def stream(self, api_key, model, messages, max_tokens, temperature) -> AsyncIterator[str]:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            async with client.stream(
                "POST",
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data:"):
                        raw = line[5:].strip()
                        if raw == "[DONE]":
                            break
                        try:
                            event = json.loads(raw)
                            delta = event["choices"][0]["delta"]
                            if "content" in delta and delta["content"]:
                                yield delta["content"]
                        except (json.JSONDecodeError, KeyError, IndexError):
                            pass


# ──────────────────────────────────────────────
# Google Gemini
# ──────────────────────────────────────────────

class GeminiAdapter(BaseAdapter):
    BASE = "https://generativelanguage.googleapis.com/v1beta"

    def _url(self, model: str, api_key: str, stream: bool = False) -> str:
        action = "streamGenerateContent" if stream else "generateContent"
        return f"{self.BASE}/models/{model}:{action}?key={api_key}"

    def _convert_messages(self, messages: list[dict]) -> tuple[str, list]:
        """Gemini uses 'contents' with 'parts' and 'systemInstruction'."""
        system_parts = []
        contents = []
        for m in messages:
            if m["role"] == "system":
                system_parts.append({"text": m["content"]})
            else:
                role = "model" if m["role"] == "assistant" else "user"
                contents.append({"role": role, "parts": [{"text": m["content"]}]})
        return system_parts, contents

    async def validate_key(self, api_key: str) -> bool:
        url = f"{self.BASE}/models?key={api_key}"
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.get(url)
        return r.status_code not in (400, 401, 403)

    async def complete(self, api_key, model, messages, max_tokens, temperature) -> str:
        system_parts, contents = self._convert_messages(messages)
        payload: dict = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }
        if system_parts:
            payload["systemInstruction"] = {"parts": system_parts}

        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                self._url(model, api_key),
                json=payload,
                headers={"Content-Type": "application/json"},
            )
        r.raise_for_status()
        data = r.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    async def stream(self, api_key, model, messages, max_tokens, temperature) -> AsyncIterator[str]:
        system_parts, contents = self._convert_messages(messages)
        payload: dict = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            },
        }
        if system_parts:
            payload["systemInstruction"] = {"parts": system_parts}

        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            async with client.stream(
                "POST",
                self._url(model, api_key, stream=True),
                json=payload,
                headers={"Content-Type": "application/json"},
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    line = line.strip()
                    if not line or line in (",", "[", "]"):
                        continue
                    if line.startswith('"text":'):
                        # Embedded in JSON object lines
                        pass
                    try:
                        obj = json.loads(line.lstrip(","))
                        text = (
                            obj.get("candidates", [{}])[0]
                            .get("content", {})
                            .get("parts", [{}])[0]
                            .get("text", "")
                        )
                        if text:
                            yield text
                    except (json.JSONDecodeError, IndexError, KeyError):
                        pass


# ──────────────────────────────────────────────
# DeepSeek  (OpenAI-compatible)
# ──────────────────────────────────────────────

class DeepSeekAdapter(OpenAIAdapter):
    BASE = "https://api.deepseek.com/v1"

    async def validate_key(self, api_key: str) -> bool:
        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 1,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            )
        return r.status_code not in (401, 403)


# ──────────────────────────────────────────────
# Kimi / Moonshot  (OpenAI-compatible)
# ──────────────────────────────────────────────

class KimiAdapter(OpenAIAdapter):
    BASE = "https://api.moonshot.cn/v1"

    async def validate_key(self, api_key: str) -> bool:
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.get(
                f"{self.BASE}/models",
                headers=self._headers(api_key),
            )
        return r.status_code not in (401, 403)


# ──────────────────────────────────────────────
# OpenRouter  (OpenAI-compatible, routes to many models)
# ──────────────────────────────────────────────

class OpenRouterAdapter(OpenAIAdapter):
    BASE = "https://openrouter.ai/api/v1"

    def _headers(self, api_key: str) -> dict:
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-agent-builder.local",
            "X-Title": "AI Agent Builder",
        }

    async def validate_key(self, api_key: str) -> bool:
        payload = {
            "model": "openrouter/auto",
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 1,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            )
        return r.status_code not in (401, 403)


# ──────────────────────────────────────────────
# Local LLM / Ollama  (OpenAI-compatible local server)
# ──────────────────────────────────────────────

class OllamaAdapter(BaseAdapter):
    BASE = "http://localhost:11434/v1"

    def _headers(self, api_key: str) -> dict:
        headers = {"Content-Type": "application/json"}
        if api_key and api_key != "ollama":
            headers["Authorization"] = f"Bearer {api_key}"
        return headers

    async def validate_key(self, api_key: str) -> bool:
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            try:
                r = await client.get("http://localhost:11434/api/tags")
                return r.status_code == 200
            except httpx.ConnectError:
                return False

    async def complete(self, api_key, model, messages, max_tokens, temperature) -> str:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            r = await client.post(
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    async def stream(self, api_key, model, messages, max_tokens, temperature) -> AsyncIterator[str]:
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
            async with client.stream(
                "POST",
                f"{self.BASE}/chat/completions",
                headers=self._headers(api_key),
                json=payload,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if line.startswith("data:"):
                        raw = line[5:].strip()
                        if raw == "[DONE]":
                            break
                        try:
                            event = json.loads(raw)
                            delta = event["choices"][0]["delta"]
                            if "content" in delta and delta["content"]:
                                yield delta["content"]
                        except (json.JSONDecodeError, KeyError, IndexError):
                            pass


# ──────────────────────────────────────────────
# Factory
# ──────────────────────────────────────────────

_REGISTRY: dict[str, BaseAdapter] = {
    "Claude":     ClaudeAdapter(),
    "ChatGPT":    OpenAIAdapter(),
    "Gemini":     GeminiAdapter(),
    "DeepSeek":   DeepSeekAdapter(),
    "Kimi":       KimiAdapter(),
    "OpenRouter": OpenRouterAdapter(),
    "Local LLM":  OllamaAdapter(),
}


def get_adapter(provider: str) -> BaseAdapter:
    adapter = _REGISTRY.get(provider)
    if adapter is None:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported provider '{provider}'. "
                   f"Choose from: {', '.join(_REGISTRY.keys())}",
        )
    return adapter
