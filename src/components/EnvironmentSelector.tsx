"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { Button } from "./ui/button";

export function EnvironmentSelector() {
  const { environments, activeEnvironmentId, setActiveEnvironment } = useEnvironmentStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeEnv = environments.find(e => e.id === activeEnvironmentId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-[180px] justify-between font-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {activeEnv ? activeEnv.name : "No Environment"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[240px] bg-background border rounded-md shadow-lg z-50 py-1 flex flex-col max-h-[300px] overflow-y-auto">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Environments
          </div>
          
          <button
            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 ${activeEnvironmentId === null ? "bg-muted/30 font-medium" : ""}`}
            onClick={() => { setActiveEnvironment(null); setIsOpen(false); }}
          >
            No Environment
          </button>
          
          {environments.map((env) => (
            <button
              key={env.id}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center justify-between group ${activeEnvironmentId === env.id ? "bg-muted/30 font-medium" : ""}`}
              onClick={() => { setActiveEnvironment(env.id); setIsOpen(false); }}
            >
              <span className="truncate flex-1">{env.name}</span>
              {env.type === "production" && (
                <span className="text-[10px] uppercase font-bold bg-destructive/20 text-destructive px-1.5 py-0.5 rounded ml-2 flex-shrink-0">Prod</span>
              )}
            </button>
          ))}
          
          <div className="border-t my-1"></div>
          
          <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 flex items-center gap-2 text-primary" onClick={() => {
            // TODO: Open Environment Manager Modal
            setIsOpen(false);
            window.dispatchEvent(new CustomEvent('open-env-manager'));
          }}>
            <Settings className="h-4 w-4" />
            Manage Environments
          </button>
        </div>
      )}
    </div>
  );
}
