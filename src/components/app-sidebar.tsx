"use client";

import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavAgents } from "@/components/nav-agents";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  LifeBuoyIcon,
  TerminalIcon,
  Rocket,
  SettingsIcon,
  MessageSquareIcon,
} from "lucide-react";
import { useAgentStore } from "@/stores/agentStore";
import type { SavedAgent } from "@/types/agent_types";
import type { AgentItem } from "@/components/nav-agents";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    savedAgents,
    loadAgent,
    selectedProfile,
    selectedSkills,
    selectedLayers,
    selectedProvider,
  } = useAgentStore();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const navMain = [
    {
      title: "Builder",
      url: "/builder/base-profiles",
      icon: <TerminalSquareIcon />,
      items: [
        {
          title: "1. Base Profiles",
          url: "/builder/base-profiles",
          hasCheckmark: !!selectedProfile,
        },
        {
          title: "2. Skills Library",
          url: "/builder/skills-library",
          hasCheckmark: selectedSkills.length > 0,
        },
        {
          title: "3. Personalities",
          url: "/builder/personalities",
          hasCheckmark: selectedLayers.length > 0,
        },
        {
          title: "4. AI Providers",
          url: "/builder/ai-providers",
          hasCheckmark: !!selectedProvider,
        },
      ],
    },
    {
      title: "Confirm & Deploy",
      url: "/builder/blueprint",
      icon: <Rocket />,
      items: [
        { title: "5. Blueprint", url: "/builder/blueprint" },
        { title: "6. Deployments", url: "/builder/deployments" },
      ],
    },
  ];

  const navSecondary = [
    {
      title: "Chat",
      url: "/chat",
      icon: <MessageSquareIcon />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <SettingsIcon />,
    },
    {
      title: "Support",
      url: "mailto:shadman.sakib.office11@gmail.com",
      icon: <LifeBuoyIcon />,
    },
  ];

  const recentAgents = [...savedAgents]
    .reverse()
    .slice(0, 3)
    .map((agent, i) => ({
      name: agent.name,
      url: "#",
      icon: <BotIcon />,
      agent,
      originalIndex: savedAgents.length - 1 - i,
    }));

  const handleAgentClick = (item: AgentItem) => {
    if (item.agent) {
      loadAgent(item.agent as SavedAgent);
      navigate("/builder");
    }
  };

  const handleChatClick = (item: AgentItem) => {
    if (item.agent) {
      loadAgent(item.agent as SavedAgent);
      navigate("/chat");
    }
  };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => navigate("/")}
              className="cursor-pointer"
            >
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} pathname={pathname} onNavigate={navigate} />
        <NavAgents
          myAgents={recentAgents}
          onAgentClick={handleAgentClick}
          onChatClick={handleChatClick}
          onMoreClick={() => navigate("/models")}
        />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: "Test User",
            email: "test@example.com",
            avatar: "/avatars/Test.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <TerminalIcon className="size-4" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-medium">AI Agent</span>
        <span className="truncate text-xs">Architect</span>
      </div>
    </div>
  );
}
