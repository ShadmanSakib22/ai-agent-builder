"""
AI Agent Builder — FastAPI Backend
Provides a stateless API for building, testing, and chatting with AI agents.
All agent blueprints remain in the client; this backend only handles
live inference calls using the user's own provider API key (BYOK).
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import asyncio
from typing import AsyncIterator

from models import (
    AgentRunRequest,
    ChatRequest,
    ChatMessage,
    ValidateKeyRequest,
    ValidateKeyResponse,
    SystemPromptRequest,
    SystemPromptResponse,
    HealthResponse,
)
from prompt_builder import build_system_prompt
from provider_adapters import get_adapter

app = FastAPI(
    title="AI Agent Builder API",
    description="BYOK backend for the AI Agent Builder prototype. "
                "No data is persisted server-side.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse, tags=["meta"])
async def health():
    return {"status": "ok", "version": "1.0.0"}


# ──────────────────────────────────────────────
# System-prompt preview
# ──────────────────────────────────────────────

@app.post("/agent/system-prompt", response_model=SystemPromptResponse, tags=["agent"])
async def preview_system_prompt(req: SystemPromptRequest):
    """
    Returns the fully-assembled system prompt that would be sent to the LLM
    for a given agent blueprint. Useful for the Blueprint page preview.
    No API key required.
    """
    prompt = build_system_prompt(req.blueprint)
    return {"system_prompt": prompt, "token_estimate": len(prompt.split())}


# ──────────────────────────────────────────────
# Key validation
# ──────────────────────────────────────────────

@app.post("/agent/validate-key", response_model=ValidateKeyResponse, tags=["agent"])
async def validate_key(req: ValidateKeyRequest):
    """
    Sends a minimal probe request to the chosen provider to confirm the
    API key is valid. Never logs or stores the key.
    """
    adapter = get_adapter(req.provider)
    try:
        valid = await adapter.validate_key(req.api_key)
        return {"valid": valid, "provider": req.provider}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


# ──────────────────────────────────────────────
# Single-turn agent run
# ──────────────────────────────────────────────

@app.post("/agent/run", tags=["agent"])
async def agent_run(req: AgentRunRequest):
    """
    Single-turn inference: build the system prompt from the blueprint,
    prepend it to the conversation, and proxy to the provider.
    Returns the full assistant response as JSON (non-streaming).
    """
    adapter = get_adapter(req.provider)
    system_prompt = build_system_prompt(req.blueprint)

    messages = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    try:
        response_text = await adapter.complete(
            api_key=req.api_key,
            model=req.model,
            messages=messages,
            max_tokens=req.max_tokens,
            temperature=req.temperature,
        )
        return {
            "role": "assistant",
            "content": response_text,
            "provider": req.provider,
            "model": req.model,
        }
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code,
            detail=f"Provider error: {exc.response.text}",
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────
# Streaming chat
# ──────────────────────────────────────────────

@app.post("/agent/chat/stream", tags=["agent"])
async def agent_chat_stream(req: ChatRequest):
    """
    Multi-turn streaming chat. Server-Sent Events (text/event-stream).
    The client sends the full conversation history each turn (stateless server).
    """
    adapter = get_adapter(req.provider)
    system_prompt = build_system_prompt(req.blueprint)

    messages = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    async def event_stream() -> AsyncIterator[str]:
        try:
            async for chunk in adapter.stream(
                api_key=req.api_key,
                model=req.model,
                messages=messages,
                max_tokens=req.max_tokens,
                temperature=req.temperature,
            ):
                yield f"data: {json.dumps({'delta': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        except httpx.HTTPStatusError as exc:
            err = json.dumps({"error": exc.response.text, "status": exc.response.status_code})
            yield f"data: {err}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# ──────────────────────────────────────────────
# Available models per provider (suggested defaults)
# ──────────────────────────────────────────────

PROVIDER_MODELS: dict[str, list[str]] = {
    "Claude": [
        "claude-opus-4-5",
        "claude-sonnet-4-5",
        "claude-haiku-4-5",
    ],
    "ChatGPT": [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-3.5-turbo",
    ],
    "Gemini": [
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
    ],
    "DeepSeek": [
        "deepseek-chat",
        "deepseek-reasoner",
    ],
    "Kimi": [
        "moonshot-v1-8k",
        "moonshot-v1-32k",
        "moonshot-v1-128k",
    ],
    "OpenRouter": [
        "openrouter/auto",
    ],
    "Local LLM": [
        "llama3.2",
    ],
}


@app.get("/providers/{provider}/models", tags=["meta"])
async def list_models(provider: str):
    """Return suggested model IDs for a given provider. Users can also type custom models."""
    models = PROVIDER_MODELS.get(provider)
    if models is None:
        raise HTTPException(status_code=404, detail=f"Unknown provider: {provider}")
    return {"provider": provider, "models": models}


@app.get("/providers", tags=["meta"])
async def list_providers():
    """Return all supported providers and their suggested models."""
    return {
        "providers": [
            {"name": name, "models": models}
            for name, models in PROVIDER_MODELS.items()
        ]
    }
