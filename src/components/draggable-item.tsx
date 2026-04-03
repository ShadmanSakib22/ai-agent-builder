"use client";

import { GripVertical, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableItemProps {
  id: string;
  type: "skill" | "layer" | "profile" | "provider";
  title: string;
  description?: string;
  isSelected: boolean;
  onToggle: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  draggingId: string | null;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function DraggableItem({
  id,
  title,
  description,
  isSelected,
  onToggle,
  onDragStart,
  onDragEnd,
  draggingId,
  badge,
  children,
}: DraggableItemProps) {
  return (
    <div
      draggable
      onDragStart={() => {
        onDragStart(id);
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex cursor-grab items-start gap-2 rounded-lg border p-2.5 text-sm transition-all active:cursor-grabbing active:opacity-60",
        isSelected
          ? "border-primary/40 bg-primary/5"
          : "border-border/60 bg-card hover:border-border hover:shadow-sm",
        draggingId === id ? "opacity-50" : "",
      )}
    >
      <GripVertical className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
      <div className="min-w-0 flex-1">
        {badge && <div className="mb-1">{badge}</div>}
        <p className="font-medium leading-tight">{title}</p>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "shrink-0 rounded-md border p-1 transition-colors",
          isSelected
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-transparent bg-muted text-muted-foreground hover:border-border hover:text-foreground",
        )}
      >
        {isSelected ? <X className="size-3" /> : <Plus className="size-3" />}
      </button>
    </div>
  );
}
