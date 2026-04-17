import { useState, useRef } from "react";
import { useAgentStore } from "@/stores/agentStore";
import { Search, Zap, Brain, User, Cpu, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProgressStepper } from "@/components/progress-stepper";
import { DraggableItem } from "@/components/draggable-item";
import { CategorySection } from "@/components/category-section";

interface BuilderProps {
  section?: "profiles" | "skills" | "layers" | "providers";
}

const PROVIDERS = ["Gemini", "ChatGPT", "Kimi", "Claude", "DeepSeek", "OpenRouter", "Local LLM"];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  information: <Zap className="size-3.5" />,
  action: <Cpu className="size-3.5" />,
  reasoning: <Brain className="size-3.5" />,
  personality: <User className="size-3.5" />,
  context: <Brain className="size-3.5" />,
  formatting: <Cpu className="size-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
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

export default function Builder({ section }: BuilderProps) {
  const {
    data,
    loading,
    selectedProfile,
    setSelectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
    setSelectedProvider,
    toggleSkill,
    toggleLayer,
  } = useAgentStore();

  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const dragItem = useRef<{
    id: string;
    type: "skill" | "layer" | "profile" | "provider";
  } | null>(null);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading configuration…
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const showProfiles = !section || section === "profiles";
  const showSkills = !section || section === "skills";
  const showLayers = !section || section === "layers";
  const showProviders = !section || section === "providers";

  const filteredSkills = data.skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredLayers = data.layers.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.type.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredProfiles = data.agentProfiles.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredProviders = PROVIDERS.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase()),
  );

  const groupedSkills = filteredSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof data.skills>,
  );

  const groupedLayers = filteredLayers.reduce(
    (acc, layer) => {
      if (!acc[layer.type]) acc[layer.type] = [];
      acc[layer.type].push(layer);
      return acc;
    },
    {} as Record<string, typeof data.layers>,
  );

  const isCategoryOpen = (cat: string) => expandedCategories[cat] !== false; // default open

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !isCategoryOpen(cat) }));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const item = dragItem.current;
    if (!item) return;
    if (item.type === "skill") toggleSkill(item.id);
    else if (item.type === "layer") toggleLayer(item.id);
    else if (item.type === "profile") setSelectedProfile(item.id);
    else if (item.type === "provider") setSelectedProvider(item.id);
    dragItem.current = null;
    setDraggingId(null);
  };

  const selectedItems = [
    ...(selectedProfile
      ? [
          {
            id: selectedProfile,
            label:
              data.agentProfiles.find((p) => p.id === selectedProfile)?.name ??
              "",
            tag: "profile",
            color:
              "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800",
          },
        ]
      : []),
    ...selectedSkills.map((id) => {
      const s = data.skills.find((x) => x.id === id);
      return {
        id,
        label: s?.name ?? "",
        tag: s?.category ?? "skill",
        color: CATEGORY_COLORS[s?.category ?? ""] ?? "",
      };
    }),
    ...selectedLayers.map((id) => {
      const l = data.layers.find((x) => x.id === id);
      return {
        id,
        label: l?.name ?? "",
        tag: l?.type ?? "layer",
        color: CATEGORY_COLORS[l?.type ?? ""] ?? "",
      };
    }),
    ...(selectedProvider
      ? [
          {
            id: selectedProvider,
            label: selectedProvider,
            tag: "provider",
            color:
              "bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:text-indigo-400 dark:border-indigo-800",
          },
        ]
      : []),
  ];

  const removeItem = (item: (typeof selectedItems)[number]) => {
    if (item.tag === "profile") setSelectedProfile("");
    else if (item.tag === "provider") setSelectedProvider("");
    else {
      const isSkill = data.skills.some((s) => s.id === item.id);
      if (isSkill) toggleSkill(item.id);
      else toggleLayer(item.id);
    }
  };

  // Define builder steps
  const builderSteps = [
    {
      id: "profiles",
      title: "Base Profiles",
      url: "/builder/base-profiles",
      isCompleted: () => !!selectedProfile,
    },
    {
      id: "skills",
      title: "Skills Library",
      url: "/builder/skills-library",
      isCompleted: () => selectedSkills.length > 0,
    },
    {
      id: "layers",
      title: "Personalities",
      url: "/builder/personalities",
      isCompleted: () => selectedLayers.length > 0,
    },
    {
      id: "providers",
      title: "AI Providers",
      url: "/builder/ai-providers",
      isCompleted: () => !!selectedProvider,
    },
    {
      id: "blueprint",
      title: "Blueprint",
      url: "/builder/blueprint",
      isCompleted: () =>
        !!selectedProfile &&
        selectedSkills.length > 0 &&
        selectedLayers.length > 0 &&
        !!selectedProvider,
    },
  ];

  return (
    <>
      <ProgressStepper steps={builderSteps} />

      <div className="flex max-h-[calc(100vh-140px)] gap-3 overflow-hidden py-4">
        {/* ── LEFT PANEL ── */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden rounded-xl rounded-bl-none rounded-tl-sm border-2 border-border p-2 md:flex-initial md:min-w-[320px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components…"
              className="h-8 w-full rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <ScrollArea className="flex-1 pr-3 pb-2">
            <div className="space-y-4 pb-4 md:w-75">
              {/* Base Profiles */}
              {showProfiles && filteredProfiles.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Base Profiles
                  </h3>
                  <div className="space-y-1">
                    {filteredProfiles.map((profile) => {
                      const isSelected = selectedProfile === profile.id;
                      return (
                        <DraggableItem
                          key={profile.id}
                          id={profile.id}
                          type="profile"
                          title={profile.name}
                          description={profile.description}
                          isSelected={isSelected}
                          onToggle={() =>
                            setSelectedProfile(isSelected ? "" : profile.id)
                          }
                          onDragStart={(id) => {
                            dragItem.current = { id, type: "profile" };
                            setDraggingId(id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          draggingId={draggingId}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Skills grouped */}
              {showSkills && Object.keys(groupedSkills).length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Skills
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(groupedSkills).map(([cat, skills]) => (
                      <CategorySection
                        key={cat}
                        title={cat}
                        icon={CATEGORY_ICONS[cat]}
                        color={CATEGORY_COLORS[cat] ?? ""}
                        count={skills.length}
                        isOpen={isCategoryOpen(cat)}
                        onToggle={() => toggleCategory(cat)}
                      >
                        {skills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill.id);
                          return (
                            <DraggableItem
                              key={skill.id}
                              id={skill.id}
                              type="skill"
                              title={skill.name}
                              description={skill.description}
                              isSelected={isSelected}
                              onToggle={() => toggleSkill(skill.id)}
                              onDragStart={(id) => {
                                dragItem.current = { id, type: "skill" };
                                setDraggingId(id);
                              }}
                              onDragEnd={() => setDraggingId(null)}
                              draggingId={draggingId}
                            />
                          );
                        })}
                      </CategorySection>
                    ))}
                  </div>
                </section>
              )}

              {/* Layers grouped */}
              {showLayers && Object.keys(groupedLayers).length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Personality Layers
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(groupedLayers).map(([type, layers]) => (
                      <CategorySection
                        key={type}
                        title={type}
                        icon={CATEGORY_ICONS[type]}
                        color={CATEGORY_COLORS[type] ?? ""}
                        count={layers.length}
                        isOpen={isCategoryOpen(`layer_${type}`)}
                        onToggle={() => toggleCategory(`layer_${type}`)}
                      >
                        {layers.map((layer) => {
                          const isSelected = selectedLayers.includes(layer.id);
                          return (
                            <DraggableItem
                              key={layer.id}
                              id={layer.id}
                              type="layer"
                              title={layer.name}
                              description={layer.description}
                              isSelected={isSelected}
                              onToggle={() => toggleLayer(layer.id)}
                              onDragStart={(id) => {
                                dragItem.current = { id, type: "layer" };
                                setDraggingId(id);
                              }}
                              onDragEnd={() => setDraggingId(null)}
                              draggingId={draggingId}
                            />
                          );
                        })}
                      </CategorySection>
                    ))}
                  </div>
                </section>
              )}

              {/* AI Providers */}
              {showProviders && filteredProviders.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    AI Providers
                  </h3>
                  <div className="space-y-1">
                    {filteredProviders.map((provider) => {
                      const isSelected = selectedProvider === provider;
                      return (
                        <DraggableItem
                          key={provider}
                          id={provider}
                          type="provider"
                          title={provider}
                          isSelected={isSelected}
                          onToggle={() =>
                            setSelectedProvider(isSelected ? "" : provider)
                          }
                          onDragStart={(id) => {
                            dragItem.current = { id, type: "provider" };
                            setDraggingId(id);
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          draggingId={draggingId}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* ── RIGHT DROP ZONE ── */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={[
              "relative flex-1 overflow-hidden rounded-xl border-2 transition-all duration-200",
              dragOver
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : selectedItems.length > 0
                  ? "border-border/60 bg-card/50"
                  : "border-dashed border-border bg-muted/30",
            ].join(" ")}
          >
            {selectedItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div
                  className={[
                    "flex size-14 items-center justify-center rounded-full border-2 transition-all",
                    dragOver
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted",
                  ].join(" ")}
                >
                  <Plus
                    className={`size-6 transition-colors ${
                      dragOver ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {dragOver ? "Release to add" : "Drag components here"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Or click the + button on any component
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col overflow-hidden">
                <div
                  className={[
                    "flex items-center justify-between border-b px-4 py-3 transition-colors",
                    dragOver
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">
                      Agent Configuration
                    </h2>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {selectedItems.length}{" "}
                      {selectedItems.length === 1 ? "trait" : "traits"}
                    </span>
                  </div>
                  {dragOver && (
                    <span className="animate-pulse text-xs text-primary">
                      Release to add →
                    </span>
                  )}
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedItems.map((item) => (
                      <div
                        key={`${item.tag}-${item.id}`}
                        className="group flex items-start gap-2.5 rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="min-w-0 flex-1">
                          <span
                            className={`mb-1.5 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium ${item.color}`}
                          >
                            {item.tag}
                          </span>
                          <p className="truncate text-sm font-medium leading-tight">
                            {item.label}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item)}
                          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Empty drop target always visible */}
                    <div
                      className={[
                        "flex items-center justify-center rounded-lg border-2 border-dashed p-4 transition-all",
                        dragOver
                          ? "border-primary/60 bg-primary/5"
                          : "border-border/40",
                      ].join(" ")}
                    >
                      <Plus
                        className={`size-5 ${
                          dragOver
                            ? "animate-pulse text-primary"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
