import { useState, useRef, useEffect } from "react";
import { useAgentStore } from "@/stores/agentStore";
import { useApiKeyStore } from "@/stores/apiKeyStore";
import { useNavigate } from "react-router-dom";
import { streamChat, listModels, type AgentBlueprint, type ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Bot,
  Send,
  Settings,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Zap,
  Layers,
  User,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const {
    data,
    selectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
    agentName,
    savedAgents,
    loadAgent,
  } = useAgentStore();

  const { getApiKey } = useApiKeyStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showAgentInfo, setShowAgentInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const profile = data?.agentProfiles.find((p) => p.id === selectedProfile);
  const skills = data?.skills.filter((s) => selectedSkills.includes(s.id)) ?? [];
  const layers = data?.layers.filter((l) => selectedLayers.includes(l.id)) ?? [];

  const activeProvider = selectedProvider || "";
  const activeApiKey = activeProvider ? getApiKey(activeProvider) : "";

  const hasAgentConfig = profile || skills.length > 0 || layers.length > 0 || agentName;

  useEffect(() => {
    if (activeProvider) {
      listModels(activeProvider)
        .then((res) => {
          setAvailableModels(res.models);
          if (res.models.length > 0 && !currentModel) {
            setCurrentModel(res.models[0]);
          }
        })
        .catch(() => {
          setAvailableModels([]);
        });
    }
  }, [activeProvider]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildBlueprint = (): AgentBlueprint => ({
    profile: profile ? { id: profile.id, name: profile.name, description: profile.description } : undefined,
    skills: skills.map((s) => ({ id: s.id, name: s.name, category: s.category, description: s.description })),
    layers: layers.map((l) => ({ id: l.id, name: l.name, type: l.type, description: l.description })),
    provider: activeProvider,
    agent_name: agentName || "Unnamed Agent",
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeProvider) {
      toast.error("Please select an AI provider in the Builder first.");
      navigate("/builder/ai-providers");
      return;
    }

    if (!activeApiKey) {
      toast.error(`Please add your ${activeProvider} API key in Settings.`);
      navigate("/settings");
      return;
    }

    if (!currentModel.trim()) {
      toast.error("Please enter a model name.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const chatMessages: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    chatMessages.push({ role: "user", content: userMessage });

    let assistantResponse = "";

    await streamChat(
      {
        blueprint: buildBlueprint(),
        messages: chatMessages,
        api_key: activeApiKey,
        provider: activeProvider,
        model: currentModel.trim(),
        max_tokens: 2048,
        temperature: 0.7,
      },
      (delta) => {
        assistantResponse += delta;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, content: assistantResponse }];
          }
          return [...prev, { role: "assistant", content: delta }];
        });
      },
      () => {
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        toast.error(`Error: ${err.message}`);
        setMessages((prev) => prev.slice(0, -1));
      }
    );
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="size-5" />
            <h1 className="text-lg font-semibold">
              {agentName || "Chat"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              Clear Chat
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <Settings className="size-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* No agent warning */}
      {!hasAgentConfig && (
        <div className="flex flex-col gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="size-4" />
            <span className="font-medium">No agent configured</span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Build an agent or load one from your saved agents to start chatting.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate("/builder/base-profiles")}>
              <Plus className="size-3" />
              Build Agent
            </Button>
            {savedAgents.length > 0 && (
              <select
                className="rounded border border-yellow-300 bg-yellow-100 px-2 py-1 text-xs dark:border-yellow-700 dark:bg-yellow-900"
                onChange={(e) => {
                  const agent = savedAgents.find((a) => a.name === e.target.value);
                  if (agent) loadAgent(agent);
                }}
                defaultValue=""
              >
                <option value="" disabled>Load saved agent...</option>
                {savedAgents.map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Agent info panel */}
      {hasAgentConfig && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{agentName || "Agent"}</span>
          </div>
          
          {profile && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3" />
              <span>{profile.name}</span>
            </div>
          )}
          
          {skills.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="size-3" />
              <span>{skills.length} skill{skills.length !== 1 ? "s" : ""}</span>
            </div>
          )}
          
          {layers.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="size-3" />
              <span>{layers.length} layer{layers.length !== 1 ? "s" : ""}</span>
            </div>
          )}
          
          {activeProvider && (
            <span className="ml-auto rounded border border-indigo-200 bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:text-indigo-400">
              {activeProvider}
            </span>
          )}
          
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowAgentInfo(!showAgentInfo)}
          >
            {showAgentInfo ? <X className="size-3" /> : <Sparkles className="size-3" />}
          </Button>
        </div>
      )}

      {/* Expanded agent info */}
      {showAgentInfo && hasAgentConfig && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Agent Configuration</h3>
          
          {profile && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-muted-foreground">Profile</h4>
              <p className="text-sm">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.description}</p>
            </div>
          )}
          
          {skills.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-muted-foreground">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s.id} className="rounded bg-muted px-2 py-0.5 text-xs">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {layers.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-muted-foreground">Personality Layers</h4>
              <div className="flex flex-wrap gap-1">
                {layers.map((l) => (
                  <span key={l.id} className="rounded bg-muted px-2 py-0.5 text-xs">
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate("/builder")}>
              Edit Agent
            </Button>
            {savedAgents.length > 0 && (
              <select
                className="rounded border border-border bg-background px-2 py-1 text-xs"
                onChange={(e) => {
                  const agent = savedAgents.find((a) => a.name === e.target.value);
                  if (agent) {
                    loadAgent(agent);
                    setMessages([]);
                  }
                }}
                defaultValue=""
              >
                <option value="" disabled>Switch agent...</option>
                {savedAgents.map((a) => (
                  <option key={a.name} value={a.name}>{a.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 rounded-xl border border-border/60 bg-card p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Bot className="size-10 opacity-30" />
              <div>
                <p className="text-sm font-medium">Ready to chat</p>
                <p className="text-xs">Enter a message below to start your conversation.</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Generating response...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Model input */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Model:</span>
        <Input
          value={currentModel}
          onChange={(e) => setCurrentModel(e.target.value)}
          placeholder="Enter model name (e.g., gpt-4o, claude-3-sonnet)"
          className="flex-1 h-8 text-xs"
          list="model-suggestions"
        />
        <datalist id="model-suggestions">
          {availableModels.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasAgentConfig ? "Type your message..." : "Configure an agent first to start chatting"}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={isLoading || !hasAgentConfig}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim() || !hasAgentConfig}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
