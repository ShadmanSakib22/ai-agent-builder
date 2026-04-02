"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DockProps {
  className?: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    onClick?: () => void;
  }[];
}

export default function Dock({ items, className }: DockProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <div
        className={cn(
          "flex items-end gap-1 p-1.5 rounded-md",
          "border border-dashed bg-background backdrop-blur-2xl shadow-lg",
        )}
        style={{
          transform: "perspective(600px) rotateX(10deg)", // arc layout illusion
        }}
      >
        <TooltipProvider delayDuration={100}>
          {items.map((item, i) => {
            const isHovered = hovered === i;

            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "relative flex flex-col items-center transition-all duration-200 ease-out",
                      isHovered && "scale-110 -rotate-3",
                    )}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn("rounded relative")}
                      onClick={() => {
                        item.onClick?.();
                      }}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6 transition-colors text-foreground",
                          isHovered && "text-accent-foreground",
                        )}
                      />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
