import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  PanelLeft,
  LayersPlus,
  SunMoon,
  Plus,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import Dock from "@/components/ui/dock";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app-sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAgentStore } from "@/stores/agentStore";
import { checkHealth } from "@/lib/api";

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

  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth();
        setBackendStatus("online");
      } catch {
        setBackendStatus("offline");
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

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
      onClick: () => {
        window.open(
          "https://shadman-portfolio-2024.vercel.app",
          "_blank",
          "noopener,noreferrer",
        );
      },
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
        {!open || isMobile ? <Logo /> : null}

        <Button
          className="hidden lg:inline-flex items-center gap-2"
          onClick={handleNewAgent}
        >
          New Agent <Plus className="size-4" />
        </Button>
      </div>

      {/* Connection Status */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
        <div className="flex items-center gap-1.5 text-xs">
          {backendStatus === "checking" && (
            <>
              <div className="size-1.5 animate-pulse rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">Checking...</span>
            </>
          )}
          {backendStatus === "online" && (
            <>
              <Wifi className="size-3.5 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                Connected
              </span>
            </>
          )}
          {backendStatus === "offline" && (
            <>
              <WifiOff className="size-3.5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">Offline</span>
            </>
          )}
        </div>
      </div>

      <div className="ml-auto">
        <Dock items={filteredNavItems} />
      </div>
    </header>
  );
}

export default Header;
