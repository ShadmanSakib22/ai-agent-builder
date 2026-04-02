import { useAgent } from "@/context/AgentContext";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Zap,
  Layers,
  Trash2,
  FolderOpen,
  Plus,
  Clock,
} from "lucide-react";

export default function Models() {
  const { savedAgents, deleteAgent, loadAgent, data } = useAgent();
  const navigate = useNavigate();

  if (savedAgents.length === 0) {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted">
          <Bot className="size-7 text-muted-foreground/50" />
        </div>
        <div>
          <h2 className="font-semibold">No models yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Deploy your first agent to see it here.
          </p>
        </div>
        <button
          onClick={() => navigate("/builder/base-profiles")}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="size-4" />
          Build Agent
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-4 overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">All Models</h1>
          <p className="text-sm text-muted-foreground">
            {savedAgents.length} deployed{" "}
            {savedAgents.length === 1 ? "agent" : "agents"}
          </p>
        </div>
        <button
          onClick={() => navigate("/builder/base-profiles")}
          className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          <Plus className="size-4" />
          New Agent
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...savedAgents].reverse().map((agent, reversedIndex) => {
          const realIndex = savedAgents.length - 1 - reversedIndex;
          const profile = data?.agentProfiles.find(
            (p) => p.id === agent.profileId,
          );
          const skillCount = agent.skillIds?.length ?? 0;
          const layerCount = agent.layerIds?.length ?? 0;

          const createdAt = agent.createdAt
            ? new Date(agent.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;

          return (
            <div
              key={realIndex}
              className="group flex flex-col rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted">
                    <Bot className="size-4.5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">
                      {agent.name}
                    </h3>
                    {profile && (
                      <p className="text-xs text-muted-foreground">
                        {profile.name}
                      </p>
                    )}
                  </div>
                </div>
                {agent.provider && (
                  <span className="shrink-0 rounded border border-indigo-200 bg-indigo-500/10 px-1.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:text-indigo-400">
                    {agent.provider}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="size-3" />
                  {skillCount} skill{skillCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="size-3" />
                  {layerCount} layer{layerCount !== 1 ? "s" : ""}
                </span>
                {createdAt && (
                  <span className="flex items-center gap-1 ml-auto">
                    <Clock className="size-3" />
                    {createdAt}
                  </span>
                )}
              </div>

              {/* Skills preview */}
              {skillCount > 0 && data && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {agent.skillIds.slice(0, 3).map((id) => {
                    const s = data.skills.find((x) => x.id === id);
                    return s ? (
                      <span
                        key={id}
                        className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {s.name}
                      </span>
                    ) : null;
                  })}
                  {skillCount > 3 && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      +{skillCount - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-border/40 pt-3">
                <button
                  onClick={() => {
                    loadAgent(agent);
                    navigate("/builder");
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/50 py-1.5 text-xs font-medium transition-all hover:bg-muted"
                >
                  <FolderOpen className="size-3.5" />
                  Load
                </button>
                <button
                  onClick={() => deleteAgent(realIndex)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
