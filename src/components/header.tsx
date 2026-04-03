import { useNavigate } from "react-router-dom";
import {
  User,
  PanelLeft,
  LayersPlus,
  SunMoon,
  Plus,
  type LucideIcon,
} from "lucide-react";

import Dock from "@/components/ui/dock";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app-sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAgentStore } from "@/stores/agentStore";

interface NavItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function Header() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { open, toggleSidebar } = useSidebar();
  const { resetAgent } = useAgentStore();
  const { theme, setTheme } = useTheme();

  const handleNewAgent = () => {
    resetAgent();
    navigate("/builder/base-profiles");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // React 19 Compiler - auto Memorize, Update: 03-03-2026
  const allNavItems: NavItem[] = [
    {
      icon: LayersPlus,
      label: "New Agent",
      onClick: handleNewAgent,
    },
    {
      icon: User,
      label: "Profile",
      onClick: () => alert("Profile clicked"),
    },
    {
      icon: SunMoon,
      label: "Toggle Theme",
      onClick: toggleTheme,
    },
    {
      icon: PanelLeft,
      label: "Toggle Sidebar",
      onClick: toggleSidebar,
    },
  ];

  const filteredNavItems = isMobile
    ? allNavItems
    : allNavItems.filter((item) => item.label !== "New Agent");

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-6 border-b border-border/50 bg-background px-4">
      <div className="flex items-center gap-4">
        {!open && <Logo />}

        <Button
          className="hidden lg:inline-flex items-center gap-2"
          onClick={handleNewAgent}
        >
          New Agent <Plus className="size-4" />
        </Button>
      </div>

      <div className="ml-auto">
        <Dock items={filteredNavItems} />
      </div>
    </header>
  );
}

export default Header;
