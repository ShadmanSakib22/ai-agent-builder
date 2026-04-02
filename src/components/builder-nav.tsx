import { useLocation } from "react-router-dom";
import { ChevronRight, Terminal } from "lucide-react";
import DockRight from "@/components/dock-right";

const STEPS = [
  { label: "Base Profiles", path: "/builder/base-profiles", step: 1 },
  { label: "Skills Library", path: "/builder/skills-library", step: 2 },
  { label: "Personalities", path: "/builder/personalities", step: 3 },
  { label: "AI Providers", path: "/builder/ai-providers", step: 4 },
  { label: "Blueprint", path: "/builder/blueprint", step: 5, ship: true },
  { label: "Deploy", path: "/builder/deployments", step: 6, ship: true },
];

export function BuilderNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const isBuilder = pathname.startsWith("/builder");
  const isModels = pathname === "/models";
  const currentStep = STEPS.find((s) => s.path === pathname);

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "") return "Home";
    if (pathname === "/builder") return "Builder";
    if (pathname === "/models") return "All Models";
    return currentStep?.label ?? "Builder";
  };

  return (
    <header className="sticky top-0 z-40 bg-background flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {isBuilder && (
          <>
            <span className="flex items-center gap-1">
              <Terminal className="size-3.5" />
              <span>Builder</span>
            </span>
            {currentStep && (
              <>
                <ChevronRight className="size-3.5" />
                <span className="font-medium text-foreground">
                  {currentStep.label}
                </span>
              </>
            )}
          </>
        )}
        {isModels && (
          <span className="font-medium text-foreground">All Models</span>
        )}
        {!isBuilder && !isModels && (
          <span className="font-medium text-foreground">{getPageTitle()}</span>
        )}
      </div>

      <div className="ml-auto">
        <DockRight />
      </div>
    </header>
  );
}
