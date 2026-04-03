import { useState } from "react";
import { useAgentStore } from "@/stores/agentStore";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  CheckCircle2,
  Bot,
  Zap,
  Layers,
  Cpu,
  AlertCircle,
} from "lucide-react";

export default function Deploy() {
  const {
    data,
    agentName,
    setAgentName,
    selectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
    saveAgent,
    resetAgent,
  } = useAgentStore();

  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const profile = data?.agentProfiles.find((p) => p.id === selectedProfile);
  const skills =
    data?.skills.filter((s) => selectedSkills.includes(s.id)) ?? [];
  const layers =
    data?.layers.filter((l) => selectedLayers.includes(l.id)) ?? [];

  const handleDeploy = async () => {
    if (!agentName.trim()) {
      setErrorMsg("Please give your agent a name before deploying.");
      setStatus("error");
      return;
    }
    setStatus("deploying");
    setErrorMsg("");
    // Simulate async deploy
    await new Promise((r) => setTimeout(r, 1200));
    const ok = saveAgent();
    if (ok) {
      setStatus("success");
    } else {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex h-[calc(100vh-7.5rem)] flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
          <CheckCircle2 className="size-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{agentName} deployed!</h2>
          <p className="mt-1.5 text-muted-foreground">
            Your agent has been saved and is ready to use.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/models")}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:bg-muted"
          >
            View All Models
          </button>
          <button
            onClick={() => {
              resetAgent();
              setStatus("idle");
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Build Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-2xl flex-col gap-5 overflow-y-auto pb-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Deploy Agent</h1>
        <p className="text-sm text-muted-foreground">
          Review your configuration and give your agent a name to deploy.
        </p>
      </div>

      {/* Config summary */}
      <div className="rounded-xl border border-border/60 bg-card">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Configuration Summary</h2>
        </div>
        <div className="space-y-3 p-5">
          <SummaryRow
            icon={<Bot className="size-4" />}
            label="Profile"
            value={profile?.name ?? "None"}
            empty={!profile}
          />
          <SummaryRow
            icon={<Zap className="size-4" />}
            label="Skills"
            value={
              skills.length > 0 ? skills.map((s) => s.name).join(", ") : "None"
            }
            empty={skills.length === 0}
          />
          <SummaryRow
            icon={<Layers className="size-4" />}
            label="Layers"
            value={
              layers.length > 0 ? layers.map((l) => l.name).join(", ") : "None"
            }
            empty={layers.length === 0}
          />
          <SummaryRow
            icon={<Cpu className="size-4" />}
            label="Provider"
            value={selectedProvider || "None"}
            empty={!selectedProvider}
          />
        </div>
      </div>

      {/* Name input */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <label
          className="mb-2 block text-sm font-semibold"
          htmlFor="agent-name"
        >
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={agentName}
          onChange={(e) => {
            setAgentName(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="e.g. Research Companion, Sales Bot, Code Reviewer…"
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
          onKeyDown={(e) => e.key === "Enter" && handleDeploy()}
        />
        {status === "error" && errorMsg && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            {errorMsg}
          </p>
        )}
      </div>

      {/* Deploy button */}
      <button
        onClick={handleDeploy}
        disabled={status === "deploying"}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "deploying" ? (
          <>
            <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Deploying…
          </>
        ) : (
          <>
            <Rocket className="size-4" />
            Deploy Agent
          </>
        )}
      </button>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  empty,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  empty: boolean;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span className="w-20 shrink-0 font-medium text-muted-foreground">
        {label}
      </span>
      <span className={empty ? "text-muted-foreground/50" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}
