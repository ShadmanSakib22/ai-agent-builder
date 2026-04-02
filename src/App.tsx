import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AgentProvider } from "@/context/AgentContext";
import { BuilderNav } from "@/components/builder-nav";

import Home from "@/pages/Home";
import Builder from "@/pages/Builder";
import Blueprint from "@/pages/Blueprint";
import Deploy from "@/pages/Deploy";
import Models from "@/pages/Models";

function App() {
  return (
    <BrowserRouter>
      <AgentProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <BuilderNav />
            <div className="flex flex-1 flex-col p-4">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/builder" element={<Builder />} />
                <Route
                  path="/builder/base-profiles"
                  element={<Builder section="profiles" />}
                />
                <Route
                  path="/builder/skills-library"
                  element={<Builder section="skills" />}
                />
                <Route
                  path="/builder/personalities"
                  element={<Builder section="layers" />}
                />
                <Route
                  path="/builder/ai-providers"
                  element={<Builder section="providers" />}
                />
                <Route path="/builder/blueprint" element={<Blueprint />} />
                <Route path="/builder/deployments" element={<Deploy />} />
                <Route path="/models" element={<Models />} />
              </Routes>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AgentProvider>
    </BrowserRouter>
  );
}

export default App;
