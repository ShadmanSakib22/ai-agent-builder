// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DockRight from "@/components/dock-right";

// Importing page components for routing
import Home from "@/pages/Home";
import Builder from "@/pages/Builder";
import BaseProfiles from "@/pages/builder/BaseProfiles";
import SkillsLibrary from "@/pages/builder/SkillsLibrary";
import Personalities from "@/pages/builder/Personalities";
import AIProviders from "@/pages/builder/AIProviders";
import Blueprint from "@/pages/builder/Blueprint";
import Deployments from "@/pages/builder/Deployments";
import Models from "@/pages/builder/Models";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4">
            <DockRight />
            {/* Routes go here */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/builder/base-profiles" element={<BaseProfiles />} />
              <Route path="/builder/skills-library" element={<SkillsLibrary />} />
              <Route path="/builder/personalities" element={<Personalities />} />
              <Route path="/builder/ai-providers" element={<AIProviders />} />
              <Route path="/builder/blueprint" element={<Blueprint />} />
              <Route path="/builder/deployments" element={<Deployments />} />
              <Route path="/builder/models" element={<Models />} />
            </Routes>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
