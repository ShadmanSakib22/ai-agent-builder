import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon, CheckCircle2 } from "lucide-react";

export function NavMain({
  items,
  pathname,
  onNavigate,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ReactNode;
    hasCheckmark?: boolean;
    items?: {
      title: string;
      url: string;
      hasCheckmark?: boolean;
    }[];
  }[];
  pathname?: string;
  onNavigate?: (path: string) => void;
}) {
  // Check if any child item is active to determine if parent should be open
  const isAnyChildActive = (childItems?: { url: string }[]) => {
    if (!childItems || !pathname) return false;
    return childItems.some((child) => pathname === child.url);
  };
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Construct</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isParentActive = isAnyChildActive(item.items);
          return (
            <Collapsible key={item.title} asChild open={isParentActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => onNavigate?.(item.url)}
                  className="cursor-pointer"
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.hasCheckmark && (
                    <CheckCircle2 className="ml-auto size-4 text-[#22c55e]!" />
                  )}
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRightIcon />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={pathname === subItem.url}
                              onClick={() => onNavigate?.(subItem.url)}
                              className="cursor-pointer"
                            >
                              <span>{subItem.title}</span>
                              {subItem.hasCheckmark && (
                                <CheckCircle2 className="ml-auto size-4 text-[#22c55e]!" />
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
