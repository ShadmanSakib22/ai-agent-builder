"use client";

import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Step {
  id: string;
  title: string;
  url: string;
  isCompleted: () => boolean;
}

interface ProgressStepperProps {
  steps: Step[];
}

export function ProgressStepper({ steps }: ProgressStepperProps) {
  const location = useLocation();

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => location.pathname === step.url);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="relative flex items-center gap-5">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = step.isCompleted();

        return (
          <Link
            key={step.id}
            to={step.url}
            className={cn(
              "relative flex flex-col items-center gap-2",
              "cursor-pointer",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 bg-background transition-all",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-background",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {step.title}
              </TooltipContent>
            </Tooltip>
            <span
              className={cn(
                "max-w-24 text-center text-xs font-medium hidden sm:block",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {step.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
