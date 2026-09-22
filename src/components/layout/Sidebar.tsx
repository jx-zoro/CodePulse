"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Terminal, History, Folder, BarChart3, Settings, BookOpen, ShieldCheck, Server, GitPullRequest } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "../WorkspaceSwitcher";

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "API Tester", href: "/test", icon: Terminal },
  { title: "Collections", href: "/collections", icon: Folder },
  { title: "Mock Servers", href: "/mock", icon: Server },
  { title: "Releases", href: "/releases", icon: GitPullRequest },
  { title: "History", href: "/history", icon: History },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Security", href: "/security", icon: ShieldCheck },
];

const bottomNavItems = [
  { title: "Documentation", href: "/docs", icon: BookOpen },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-14 flex items-center px-4 border-b font-semibold text-lg gap-2 text-primary">
        <Activity className="h-5 w-5 text-info" />
        CodePulse
      </div>

      <div className="p-4 border-b">
        <WorkspaceSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid gap-1 px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="border-t p-4">
        <ul className="grid gap-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}



