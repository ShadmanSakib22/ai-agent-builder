# AI Agent Builder

A visual, no-code web application for building, configuring, and testing AI agents. Design your perfect AI assistant by combining base profiles, skills, and personality layers, then chat with it using your own API keys.

![AI Agent Builder](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-green) ![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)

## Features

- **Visual Agent Builder** — Drag-and-drop interface to compose AI agents
- **Base Profiles** — Pre-configured agent personas (Customer Support, Research Assistant, Code Assistant, etc.)
- **Skills Library** — Add capabilities like Web Search, Code Generation, Translation, and more
- **Personality Layers** — Customize tone and behavior (Concise Mode, Fact Checker, Pirate Persona, etc.)
- **Multi-Provider Support** — Use OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Kimi, OpenRouter, or local Ollama
- **Real-time Chat** — Test your agent instantly with streaming responses
- **API Key Management** — Securely store your provider API keys locally
- **Blueprint Preview** — View the generated system prompt before deploying
- **Persistent Agents** — Save and manage multiple agent configurations

## Architecture

```
Browser (React + Zustand + Tailwind)
│  agent blueprint (localStorage)
│  api_key (user-supplied)
▼
FastAPI Backend (Python)
│  routes requests to LLM providers
▼
Anthropic / OpenAI / Google / DeepSeek / Ollama / OpenRouter
```

**Frontend**: React 19, TypeScript, Tailwind CSS, Zustand (state), shadcn/ui (components)

**Backend**: FastAPI, httpx (HTTP client), Pydantic (validation)

## Prerequisites

- Node.js 18+
- Python 3.10+
- API keys for your chosen LLM provider(s)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-agent-builder.git
cd ai-agent-builder
```

### 2. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`. Visit `/docs` for the interactive Swagger UI.

### 3. Start the Frontend

```bash
# From project root
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 4. Configure API Keys

1. Go to **Settings** in the sidebar
2. Enter your API key for at least one provider
3. Click **Validate** to verify the key works

## Usage Guide

### Building an Agent

1. **Start at Builder** — Navigate to `/builder/base-profiles`
2. **Choose Base Profile** — Select an agent persona (e.g., "Customer Support Agent")
3. **Add Skills** — Enable capabilities like Web Search, Translation, or Code Generation
4. **Set Personality** — Choose behavior layers like "Concise Mode" or "Fact Checker"
5. **Select Provider** — Pick your LLM provider (OpenRouter, Claude, GPT, etc.)
6. **Review Blueprint** — See the generated system prompt and all selected components
7. **Deploy** — Give your agent a name and save it

### Testing Your Agent

1. Go to **Chat** from the sidebar
2. Your saved agent loads automatically
3. Enter a model name (use suggestions like `gpt-4o` or `claude-3-sonnet`)
4. Start chatting with your configured agent

### Managing Saved Agents

- View all agents at `/models`
- Click **Chat** to test an agent
- Click **Load** to edit an agent's configuration
- Quick access to recent agents in the sidebar

## Supported Providers

| Provider | API Base | Notes |
|----------|----------|-------|
| **OpenRouter** | `openrouter.ai/api/v1` | Routes to hundreds of models. Recommended for variety. |
| **Claude** (Anthropic) | `api.anthropic.com` | Requires `x-api-key` header |
| **ChatGPT** (OpenAI) | `api.openai.com` | Standard OpenAI API |
| **Gemini** (Google) | `generativelanguage.googleapis.com` | Uses `?key=` query param |
| **DeepSeek** | `api.deepseek.com` | OpenAI-compatible |
| **Kimi** (Moonshot) | `api.moonshot.cn` | OpenAI-compatible |
| **Local LLM** (Ollama) | `localhost:11434/v1` | No API key needed. Requires Ollama running locally. |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/providers` | List all providers and models |
| `GET` | `/providers/{provider}/models` | Get models for a provider |
| `POST` | `/agent/system-prompt` | Preview generated system prompt |
| `POST` | `/agent/validate-key` | Verify API key is valid |
| `POST` | `/agent/run` | Single-turn inference |
| `POST` | `/agent/chat/stream` | Multi-turn streaming chat |

## Project Structure

```
ai-agent-builder/
├── public/
│   └── data.json          # Agent profiles, skills, layers data
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── nav-agents.tsx
│   │   └── header.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/
│   │   ├── api.ts        # TypeScript API client
│   │   └── utils.ts      # Utility functions
│   ├── pages/
│   │   ├── Builder.tsx   # Agent builder
│   │   ├── Blueprint.tsx  # Config preview
│   │   ├── Chat.tsx      # Chat interface
│   │   ├── Deploy.tsx    # Deploy agent
│   │   ├── Models.tsx   # Saved agents
│   │   └── Settings.tsx  # API key management
│   ├── stores/
│   │   ├── agentStore.ts    # Agent state (Zustand)
│   │   └── apiKeyStore.ts   # API keys state
│   └── types/
│       └── agent_types.ts   # TypeScript interfaces
├── backend/
│   ├── main.py           # FastAPI app
│   ├── models.py         # Pydantic schemas
│   ├── provider_adapters.py # LLM provider HTTP adapters
│   ├── prompt_builder.py # System prompt assembly
│   └── requirements.txt  # Python dependencies
└── package.json
```

## Security Notes

- **API keys are never stored on the server** — they exist only in the browser's localStorage and are sent directly to the LLM provider
- **Backend is stateless** — no user data is persisted server-side
- **CORS restricted** — backend allows localhost by default
- For production, deploy behind a reverse proxy with TLS and rate limiting

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Development

```bash
# Run frontend
npm run dev

# Run backend
cd backend && uvicorn main:app --reload

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## License

MIT License

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
