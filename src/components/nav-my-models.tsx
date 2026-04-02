"use client";

import { useNavigate } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BotIcon, EllipsisVertical } from "lucide-react";
import { useModelStore } from "@/store/modelStore";
import { useAgentBuilderStore } from "@/store/agentBuilderStore";

export function NavMyModels() {
  const navigate = useNavigate();
  const { recentModels } = useModelStore();
  const { loadFromModel } = useAgentBuilderStore();

  const handleLoadModel = (modelId: string) => {
    const model = recentModels.find((m) => m.id === modelId);
    if (model) {
      loadFromModel(model);
      navigate("/builder/base-profiles");
    }
  };

  const handleViewAllModels = () => {
    navigate("/builder/models");
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>My Models</SidebarGroupLabel>
      <SidebarMenu>
        {recentModels.length === 0 ? (
          <SidebarMenuItem>
            <p className="text-xs text-muted-foreground px-2 py-1">No models yet</p>
          </SidebarMenuItem>
        ) : (
          recentModels.map((model) => (
            <SidebarMenuItem key={model.id}>
              <SidebarMenuButton
                asChild
                onClick={() => handleLoadModel(model.id)}
                className="cursor-pointer"
              >
                <button type="button" className="flex items-center w-full text-left">
                  <BotIcon className="w-4 h-4" />
                  <span className="truncate">{model.name}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
        <SidebarMenuItem>
          <SidebarMenuButton asChild onClick={handleViewAllModels}>
            <button type="button" className="flex items-center w-full text-left">
              <EllipsisVertical className="w-4 h-4" />
              <span>View All Models</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
