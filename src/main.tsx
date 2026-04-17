import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <TooltipProvider>
        <Toaster position="bottom-right" richColors />
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
