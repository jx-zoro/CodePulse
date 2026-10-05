"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  LayoutDashboard, 
  Terminal, 
  History, 
  Folder, 
  BarChart3, 
  Settings, 
  BookOpen, 
  ShieldCheck, 
  Server, 
  GitPullRequest,
  ChevronDown,
  ChevronRight,
  Code2,
  Database,
  LineChart,
  Search,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher";

interface NavGroupProps {
  title: string;
  items: { title: string; href: string; icon: any }[];
  defaultExpanded?: boolean;
}

function NavGroup({ title, items, defaultExpanded = true }: NavGroupProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-4 px-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {title}
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      
      {expanded && (
        <ul className="mt-1 space-y-0.5">
          {items.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent/80 text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "opacity-70")} />
                  {item.title}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-14 flex items-center px-4 border-b font-bold text-lg gap-2 text-foreground tracking-tight">
        <div className="bg-primary/20 p-1.5 rounded-md">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        CodePulse
      </div>

      <div className="p-3 border-b border-border/50 bg-muted/20">
        <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">Active Workspace</div>
        <WorkspaceSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <NavGroup 
          title="Observability" 
          items={[
            { title: "Control Center", href: "/dashboard", icon: LayoutDashboard },
            { title: "Execution Logs", href: "/history", icon: History },
            { title: "Performance", href: "/analytics", icon: LineChart },
          ]} 
        />
        
        <NavGroup 
          title="Engineering" 
          items={[
            { title: "API Workspace", href: "/test", icon: Terminal },
            { title: "Collections", href: "/collections", icon: Folder },
            { title: "API Import", href: "/import", icon: Network },
            { title: "Mock Servers", href: "/mock", icon: Server },
          ]} 
        />

        <NavGroup 
          title="Governance" 
          items={[
            { title: "API Security", href: "/security", icon: ShieldCheck },
            { title: "Versioning", href: "/releases", icon: GitPullRequest },
          ]} 
        />
      </div>
      
      <div className="border-t border-border/50 p-3 bg-muted/10">
        <ul className="space-y-0.5 px-2">
          <li>
            <Link
              href="/docs"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/docs") ? "bg-accent/80 text-primary" : "text-muted-foreground"
              )}
            >
              <BookOpen className="h-4 w-4 opacity-70" />
              Documentation
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith("/settings") ? "bg-accent/80 text-primary" : "text-muted-foreground"
              )}
            >
              <Settings className="h-4 w-4 opacity-70" />
              Settings
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

