import { ExternalLink, FileText } from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Home = () => {
  const CV_URL =
    "https://docs.google.com/document/d/e/2PACX-1vQgTf_PdULsf89fFyrTuJZ68j1g9HiqVLBg-8oKsWXs2wtd1AEyTWrQ8qDCxC9_GyeknixBhFsDfG6X/pub?embedded=true";

  const EXTERNAL_URL =
    "https://docs.google.com/document/d/1AfoRBbfB1XtLpmfmjBaJtwM2Fvgc9dG5OcX-iFDi-U8/edit?tab=t.0#heading=h.5rf9wr4r3no2";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
            <FileText className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Curriculum Vitae
            </h1>
            <p className="text-sm text-muted-foreground">Software Engineer</p>
          </div>
        </div>

        <Button size="sm" asChild className="w-full sm:w-auto">
          <a href={EXTERNAL_URL} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-4" />
            Get Document
          </a>
        </Button>
      </div>

      <Separator />

      {/* Main CV Container */}
      <div className="relative rounded-xl border border-border bg-card shadow-lg overflow-hidden">
        {/* We use the shadcn ScrollArea for the vertical scroll.
            The horizontal scroll is handled by the inner container.
        */}
        <ScrollArea className="h-[calc(100vh-14rem)] w-full">
          {/* Horizontal Scroll Logic:
              - On mobile: justify-start + overflow-x-auto allows swiping.
              - On desktop: justify-center keeps it professional.
          */}
          <div className="flex justify-start md:justify-center bg-muted/30 p-4 sm:p-8 overflow-x-auto outline-none">
            {/* Min-Width Strategy:
                We force 800px on small screens so the Google Doc text 
                remains at a readable font size.
            */}
            <div className="min-w-[800px] md:min-w-0 w-full max-w-[850px] shadow-2xl rounded-sm overflow-hidden bg-white">
              <iframe
                src={CV_URL}
                // High fixed height ensures the ScrollArea takes over
                style={{ height: "3200px", width: "100%", border: "none" }}
                scrolling="no"
                title="Portfolio CV"
                className="overflow-hidden"
                loading="lazy"
              />
            </div>
          </div>
          {/* Add a horizontal scrollbar specifically for the shadcn ScrollArea */}
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Mobile Swipe Indicator */}
        <div className="block md:hidden bg-muted/50 py-1 text-center border-t border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            ← Swipe horizontally to read →
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
