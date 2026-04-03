import { useAgentStore } from "@/stores/agentStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Brain,
  User,
  Cpu,
  Bot,
  Layers,
  Rocket,
  ArrowRight,
} from "lucide-react";

type Category =
  | "information"
  | "action"
  | "reasoning"
  | "personality"
  | "context"
  | "formatting";

interface CategoryStyles {
  [key: string]: string;
}

const CATEGORY_COLORS: CategoryStyles = {
  information:
    "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
  action:
    "bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-800 dark:text-orange-400",
  reasoning:
    "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400",
  personality:
    "bg-pink-500/10 text-pink-600 border-pink-200 dark:border-pink-800 dark:text-pink-400",
  context:
    "bg-teal-500/10 text-teal-600 border-teal-200 dark:border-teal-800 dark:text-teal-400",
  formatting:
    "bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800 dark:text-yellow-400",
};

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  information: <Zap className="size-3.5" />,
  action: <Cpu className="size-3.5" />,
  reasoning: <Brain className="size-3.5" />,
  personality: <User className="size-3.5" />,
  context: <Brain className="size-3.5" />,
  formatting: <Cpu className="size-3.5" />,
};

interface ConfigCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ConfigCard({ title, icon, children }: ConfigCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

interface CategoryItemCardProps {
  name: string;
  description: string;
  isSelected: boolean;
}

function CategoryItemCard({
  name,
  description,
  isSelected,
}: CategoryItemCardProps) {
  return (
    <div
      className={[
        "rounded-lg border p-3 text-sm transition-all",
        isSelected
          ? "border-primary/40 bg-primary/5"
          : "border-border/40 bg-muted/20",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">{name}</p>
        {isSelected && (
          <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
            active
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function Blueprint() {
  const {
    data,
    loading,
    selectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
  } = useAgentStore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const profile = data.agentProfiles.find((p) => p.id === selectedProfile);
  const skills = data.skills.filter((s) => selectedSkills.includes(s.id));
  const layers = data.layers.filter((l) => selectedLayers.includes(l.id));

  const isEmpty =
    !profile && skills.length === 0 && layers.length === 0 && !selectedProvider;

  // Group all skills by category
  const allSkillsByCategory = data.skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof data.skills>,
  );

  // Group all layers by type
  const allLayersByType = data.layers.reduce(
    (acc, layer) => {
      if (!acc[layer.type]) acc[layer.type] = [];
      acc[layer.type].push(layer);
      return acc;
    },
    {} as Record<string, typeof data.layers>,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-semibold">Blueprint</h1>
          <p className="text-sm text-muted-foreground">
            Full overview of your agent&apos;s configuration and all available
            components.
          </p>
        </div>
        <Button onClick={() => navigate("/builder/deployments")}>
          <Rocket className="size-4" />
          Deploy Agent
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {/* Current config summary */}
      <div className="rounded-xl border border-border/60 bg-card pb-4">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Current Configuration</h2>
        </div>
        {isEmpty ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Bot className="size-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No traits selected yet.
            </p>
            <Button
              variant="link"
              onClick={() => navigate("/builder/base-profiles")}
              className="mt-1 h-auto p-0 text-xs"
            >
              Start building →
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Profile */}
            <ConfigCard title="Profile" icon={<Bot className="size-3.5" />}>
              {profile ? (
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {profile.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">None</p>
              )}
            </ConfigCard>

            {/* Skills */}
            <ConfigCard
              title={`Skills (${skills.length})`}
              icon={<Zap className="size-3.5" />}
            >
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${CATEGORY_COLORS[s.category] ?? ""}`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">None</p>
              )}
            </ConfigCard>

            {/* Layers */}
            <ConfigCard
              title={`Layers (${layers.length})`}
              icon={<Layers className="size-3.5" />}
            >
              {layers.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {layers.map((l) => (
                    <span
                      key={l.id}
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${CATEGORY_COLORS[l.type] ?? ""}`}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/60">None</p>
              )}
            </ConfigCard>

            {/* Provider */}
            <ConfigCard title="Provider" icon={<Cpu className="size-3.5" />}>
              {selectedProvider ? (
                <span className="inline-flex items-center rounded border border-indigo-200 bg-indigo-500/10 px-2 py-0.5 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:text-indigo-400">
                  {selectedProvider}
                </span>
              ) : (
                <p className="text-sm text-muted-foreground/60">None</p>
              )}
            </ConfigCard>
          </div>
        )}
      </div>

      {/* All skills reference */}
      <div className="rounded-xl border border-border/60 bg-card pb-4">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">All Available Skills</h2>
        </div>
        <div className="divide-y divide-border/30 px-5">
          {Object.entries(allSkillsByCategory).map(([cat, catSkills]) => (
            <div key={cat} className="py-4 first:pt-4 last:pb-0">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[cat] ?? ""}`}
                >
                  {CATEGORY_ICONS[cat as Category] || null}
                  {cat}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <CategoryItemCard
                      key={skill.id}
                      name={skill.name}
                      description={skill.description}
                      isSelected={isSelected}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All layers reference */}
      <div className="rounded-xl border border-border/60 bg-card pb-4">
        <div className="border-b border-border/40 px-5 py-3.5">
          <h2 className="text-sm font-semibold">All Available Layers</h2>
        </div>
        <div className="divide-y divide-border/30 px-5">
          {Object.entries(allLayersByType).map(([type, typeLayers]) => (
            <div key={type} className="py-4 first:pt-4 last:pb-0">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[type] ?? ""}`}
                >
                  {CATEGORY_ICONS[type as Category] || null}
                  {type}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {typeLayers.map((layer) => {
                  const isSelected = selectedLayers.includes(layer.id);
                  return (
                    <CategoryItemCard
                      key={layer.id}
                      name={layer.name}
                      description={layer.description}
                      isSelected={isSelected}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
