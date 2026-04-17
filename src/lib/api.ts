/**
 * api.ts — typed client for the AI Agent Builder FastAPI backend.
 *
 * Drop this file into src/lib/ and import where needed.
 * The base URL reads from VITE_API_URL (default: http://localhost:8000).
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Layer {
  id: string;
  name: string;
  type: string;
  description: string;
}

export interface AgentBlueprint {
  profile?: AgentProfile;
  skills: Skill[];
  layers: Layer[];
  provider: string;
  agent_name: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RunPayload {
  blueprint: AgentBlueprint;
  messages: ChatMessage[];
  api_key: string;
  provider: string;
  model: string;
  max_tokens?: number;
  temperature?: number;
}

export interface RunResponse {
  role: "assistant";
  content: string;
  provider: string;
  model: string;
}

export interface SystemPromptResponse {
  system_prompt: string;
  token_estimate: number;
}

export interface ValidateKeyResponse {
  valid: boolean;
  provider: string;
}

export interface ProviderModels {
  provider: string;
  models: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`[${res.status}] ${detail}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`[${res.status}] ${await res.text()}`);
  return res.json() as Promise<T>;
}

// ── API methods ───────────────────────────────────────────────────────────────

/** Ping the server — useful on app start to confirm the backend is up. */
export const checkHealth = () =>
  get<{ status: string; version: string }>("/health");

/** Preview the assembled system prompt without making an LLM call. */
export const previewSystemPrompt = (blueprint: AgentBlueprint) =>
  post<SystemPromptResponse>("/agent/system-prompt", { blueprint });

/** Verify that a provider API key is accepted. */
export const validateKey = (provider: string, api_key: string) =>
  post<ValidateKeyResponse>("/agent/validate-key", { provider, api_key });

/** Single-turn non-streaming agent call. */
export const runAgent = (payload: RunPayload) =>
  post<RunResponse>("/agent/run", payload);

/** Multi-turn streaming chat. Returns an EventSource-compatible ReadableStream. */
export async function streamChat(
  payload: RunPayload,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/agent/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok || !res.body) {
      onError(new Error(`Stream failed: ${res.status}`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (raw === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(raw) as { delta?: string; error?: string };
          if (parsed.error) {
            onError(new Error(parsed.error));
            return;
          }
          if (parsed.delta) onDelta(parsed.delta);
        } catch {
          // ignore malformed lines
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}

/** List models available for a provider. */
export const listModels = (provider: string) =>
  get<ProviderModels>(`/providers/${encodeURIComponent(provider)}/models`);

/** List all supported providers and their models. */
export const listProviders = () =>
  get<{ providers: ProviderModels[] }>("/providers");
