"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { MoreHorizontalIcon, MessageSquareIcon } from "lucide-react";

export interface AgentItem {
  name: string;
  url: string;
  icon: React.ReactNode;
  agent?: unknown;
}

interface NavAgentsProps {
  myAgents: AgentItem[];
  onAgentClick?: (item: AgentItem) => void;
  onChatClick?: (item: AgentItem) => void;
  onMoreClick?: () => void;
}

export function NavAgents({
  myAgents,
  onAgentClick,
  onChatClick,
  onMoreClick,
}: NavAgentsProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>My Agents</SidebarGroupLabel>
      <SidebarMenu>
        {myAgents.length === 0 ? (
          <SidebarMenuItem>
            <span className="px-2 py-1 text-xs text-muted-foreground/60">
              No agents yet
            </span>
          </SidebarMenuItem>
        ) : (
          myAgents.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild={!onChatClick}
                onClick={onChatClick ? () => onChatClick(item) : undefined}
              >
                {onChatClick ? (
                  <button className="flex w-full items-center gap-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ) : (
                  <a href={item.url}>
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={
                      onChatClick ? () => onChatClick(item) : undefined
                    }
                  >
                    <MessageSquareIcon className="text-muted-foreground" />
                    <span>Chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={
                      onAgentClick ? () => onAgentClick(item) : undefined
                    }
                  >
                    <span>Load Agent</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}

        {/* "More" → /models */}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onMoreClick}>
            <MoreHorizontalIcon />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
