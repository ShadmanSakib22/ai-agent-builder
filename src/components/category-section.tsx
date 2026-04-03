"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CategorySection({
  title,
  icon,
  color,
  count,
  isOpen,
  onToggle,
  children,
}: CategorySectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {isOpen ? (
          <ChevronDown className="size-3" />
        ) : (
          <ChevronRight className="size-3" />
        )}
        <span className={cn("inline-flex items-center gap-1 rounded border px-1.5 py-0.5", color)}>
          {icon}
          {title}
        </span>
        <span className="ml-auto text-muted-foreground/60">{count}</span>
      </button>
      {isOpen && <div className="mt-1 space-y-1 pl-3">{children}</div>}
    </div>
  );
}
