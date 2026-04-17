# AI Agent Builder — FastAPI Backend

Stateless BYOK (Bring Your Own Key) backend for the AI Agent Builder frontend.

**Nothing is persisted server-side.** Agent blueprints live in the browser's
localStorage. This service only handles live LLM inference calls, routing each
request to the correct provider using the API key the client supplies.

---

## Architecture

```
Browser (React + Zustand)
   │  agent blueprint (localStorage)
   │  api_key (session input)
   ▼
FastAPI  ──►  Anthropic / OpenAI / Gemini / DeepSeek / Kimi
```

```
backend/
├── main.py               # FastAPI app, route definitions
├── models.py             # Pydantic request / response schemas
├── prompt_builder.py     # Assembles system prompt from AgentBlueprint
├── provider_adapters.py  # Per-provider HTTP adapter (validate / complete / stream)
├── api_client.ts         # TypeScript client — copy to src/lib/
├── requirements.txt
└── .env.example
```

---

## Quick start

```bash
# 1 — create a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2 — install dependencies
pip install -r requirements.txt

# 3 — (optional) configure defaults
cp .env.example .env
# edit .env if you want server-side default keys

# 4 — run
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API reference

| Method | Path                           | Description                                     |
| ------ | ------------------------------ | ----------------------------------------------- |
| GET    | `/health`                      | Server health check                             |
| GET    | `/providers`                   | All providers + model lists                     |
| GET    | `/providers/{provider}/models` | Models for one provider                         |
| POST   | `/agent/system-prompt`         | Preview assembled system prompt (no LLM call)   |
| POST   | `/agent/validate-key`          | Check if an API key is accepted by the provider |
| POST   | `/agent/run`                   | Single-turn non-streaming inference             |
| POST   | `/agent/chat/stream`           | Multi-turn streaming chat (SSE)                 |

Full schema docs at `/docs` (Swagger) or `/redoc`.

---

## Request body — AgentBlueprint

The blueprint mirrors exactly what the frontend stores in localStorage:

```json
{
  "profile": {
    "id": "profile_1",
    "name": "Customer Support",
    "description": "..."
  },
  "skills": [
    {
      "id": "sk_search",
      "name": "Web Search",
      "category": "information",
      "description": "..."
    }
  ],
  "layers": [
    {
      "id": "ly_cot",
      "name": "Chain of Thought",
      "type": "reasoning",
      "description": "..."
    }
  ],
  "provider": "Claude",
  "agent_name": "My Support Bot"
}
```

The server assembles a structured system prompt from this and prepends it to
the conversation before calling the LLM.

---

## Supported providers

| Name           | API base                                     | Auth header                      |
| -------------- | -------------------------------------------- | -------------------------------- |
| **Claude**     | `api.anthropic.com`                          | `x-api-key`                      |
| **ChatGPT**    | `api.openai.com`                             | `Authorization: Bearer`          |
| **Gemini**     | `generativelanguage.googleapis.com`          | `?key=` query param              |
| **DeepSeek**   | `api.deepseek.com` (OpenAI-compat)           | `Authorization: Bearer`          |
| **Kimi**       | `api.moonshot.cn` (OpenAI-compat)            | `Authorization: Bearer`          |
| **OpenRouter** | `openrouter.ai/api/v1` (OpenAI-compat)       | `Authorization: Bearer`          |
| **Local LLM**  | `localhost:11434/v1` (Ollama, OpenAI-compat) | Optional `Authorization: Bearer` |

---

## Security notes

- API keys are **never logged, cached, or stored** — they exist only in memory
  during the duration of a single HTTP request.
- The backend is CORS-restricted to localhost by default. Update
  `ALLOWED_ORIGINS` in `.env` when deploying.
- For production, put the backend behind a reverse proxy (nginx/Caddy) with
  TLS and rate limiting.
