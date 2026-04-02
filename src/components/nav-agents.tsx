"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { MoreHorizontalIcon, FolderIcon, Trash2Icon } from "lucide-react";

interface AgentItem {
  name: string;
  url: string;
  icon: React.ReactNode;
  agent?: unknown;
}

export function NavAgents({
  myAgents,
  onAgentClick,
  onMoreClick,
}: {
  myAgents: AgentItem[];
  onAgentClick?: (item: AgentItem) => void;
  onMoreClick?: () => void;
}) {
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
                asChild={!onAgentClick}
                onClick={onAgentClick ? () => onAgentClick(item) : undefined}
              >
                {onAgentClick ? (
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
                      onAgentClick ? () => onAgentClick(item) : undefined
                    }
                  >
                    <FolderIcon className="text-muted-foreground" />
                    <span>Load Agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2Icon className="text-destructive" />
                    <span>Delete Agent</span>
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
