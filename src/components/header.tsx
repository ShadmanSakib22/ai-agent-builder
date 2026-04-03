import Dock from "@/components/ui/dock";
import { User, PanelLeft, LayersPlus, SunMoon, Plus } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app-sidebar";

const NavItems = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
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

  if (!isMobile) {
    const navItemsLg = navItems.filter((item) => item.label !== "New Agent");
    return <Dock items={navItemsLg} />;
  }

  return <Dock items={navItems} />;
};

export function Header() {
  const { open } = useSidebar();

  return (
    <header className="sticky top-0 z-40 bg-background flex h-14 shrink-0 items-center justify-between gap-6 border-b border-border/50 px-4">
      {!open && <Logo />}

      <Button className="hidden lg:inline-flex">
        New Agent <Plus />
      </Button>

      <div className="ml-auto">
        <NavItems />
      </div>
    </header>
  );
}

export default Header;
