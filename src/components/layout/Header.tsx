"use client";

import { Bell, Search, Menu, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentSelector } from "@/components/EnvironmentSelector";
import { UserNav } from "./UserNav";
import { useContext } from "react";
import { CopilotContext } from "./AppLayout";
import { usePathname } from "next/navigation";

export function Header() {
  const { openCopilot } = useContext(CopilotContext);
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const paths = pathname.split('/').filter(Boolean);
  const currentPath = paths[paths.length - 1] || 'dashboard';
  const displayPath = currentPath.charAt(0).toUpperCase() + currentPath.slice(1);

  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-bold text-lg text-foreground flex items-center gap-2">
          CodePulse
        </span>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>Workspace</span>
        <ChevronRight className="h-4 w-4 opacity-50" />
        <span className="text-foreground capitalize">{displayPath}</span>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center max-w-xl px-8">
        <div 
          className="relative w-full max-w-md cursor-pointer group"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="absolute left-3 top-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <div className="w-full pl-9 pr-3 py-1.5 bg-muted/40 border border-border/50 rounded-md text-sm text-muted-foreground group-hover:border-primary/30 group-hover:bg-muted/80 transition-all flex items-center justify-between shadow-sm">
            <span>Search workspace...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded bg-background px-1.5 font-mono text-[10px] font-medium border shadow-sm text-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors gap-2 shadow-sm h-8"
          onClick={() => openCopilot()}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Ask Copilot</span>
        </Button>
        
        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block"></div>
        
        <EnvironmentSelector />
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>
        </Button>
        
        <div className="pl-1">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
