"use client";

import { Bell, Search, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnvironmentSelector } from "@/components/EnvironmentSelector";
import { UserNav } from "./UserNav";
import { useContext } from "react";
import { CopilotContext } from "./AppLayout";

export function Header() {
  const { openCopilot } = useContext(CopilotContext);

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-lg text-primary flex items-center gap-2">
          CodePulse
        </span>
      </div>

      <div className="hidden md:flex items-center w-full max-w-md ml-4">
        <div 
          className="relative w-full cursor-pointer group"
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent rounded-md text-sm text-muted-foreground group-hover:border-input group-hover:bg-background transition-colors flex items-center justify-between">
            <span>Search endpoints, collections...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-primary border-primary/20 bg-primary/10 hover:bg-primary/20 transition-colors gap-2"
          onClick={() => openCopilot()}
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Copilot</span>
        </Button>
        <EnvironmentSelector />
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <UserNav />
      </div>
    </header>
  );
}
