"use client";

import * as React from "react";

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
  SendIcon,
  TerminalIcon,
  Rocket,
} from "lucide-react";

// Todo: Move data fetching to a loader or useSWR for better performance and separation of concerns
// Mock data for navigation and user
const data = {
  user: {
    name: "Shadman Sakib",
    email: "shadman.sakib.office11@gmail.com",
    avatar: "/avatars/Shadman.jpg",
  },
  navMain: [
    {
      title: "Builder",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Base Profiles",
          url: "#",
        },
        {
          title: "Skills Library",
          url: "#",
        },
        {
          title: "Personalities",
          url: "#",
        },
        {
          title: "AI Providers",
          url: "#",
        },
      ],
    },
    {
      title: "Ship",
      url: "#",
      icon: <Rocket />,
      isActive: true,
      items: [
        {
          title: "Blueprint",
          url: "#",
        },
        {
          title: "Deployments",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "#",
      icon: <SendIcon />,
    },
  ],
  myAgents: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <BotIcon />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <BotIcon />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <BotIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">AI Agent</span>
                  <span className="truncate text-xs">Architect</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAgents myAgents={data.myAgents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
