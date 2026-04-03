import { useState } from "react";
import { useAgentStore } from "@/stores/agentStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
          <Button variant="outline" onClick={() => navigate("/models")}>
            View All Models
          </Button>
          <Button
            onClick={() => {
              resetAgent();
              navigate("/builder/base-profiles");
            }}
          >
            Build Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-2xl flex-col gap-5 pb-6">
      {/* Header */}
      <div className="px-1">
        <h1 className="text-lg font-semibold">Deploy Agent</h1>
        <p className="text-sm text-muted-foreground">
          Review your configuration and give your agent a name to deploy.
        </p>
      </div>

      {/* Config summary */}
      <div className="rounded-xl border border-border/60 bg-card px-1">
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
        <Input
          id="agent-name"
          value={agentName}
          onChange={(e) => {
            setAgentName(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="e.g. Research Companion, Sales Bot, Code Reviewer…"
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
      <Button
        onClick={handleDeploy}
        disabled={status === "deploying"}
        size="lg"
        className="w-full"
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
      </Button>
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
