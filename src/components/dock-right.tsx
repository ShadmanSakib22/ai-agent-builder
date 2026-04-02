import Dock from "@/components/ui/dock";
import { User, PanelLeft, LayersPlus, SunMoon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/theme-provider";

const DockRight = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const dockItems = [
    {
      icon: LayersPlus,
      label: "New Agent",
      onClick: () => alert("New Agent clicked"),
    },
    { icon: User, label: "Profile", onClick: () => alert("Profile clicked") },
    {
      icon: SunMoon,
      label: "Toggle Theme",
      onClick: toggleTheme,
    },
    {
      icon: PanelLeft,
      label: "Toggle Sidebar",
      onClick: () => toggleSidebar(),
    },
  ];

  return (
    <div className="fixed z-1 bottom-2 right-2">
      <Dock items={dockItems} />
    </div>
  );
};

export default DockRight;
