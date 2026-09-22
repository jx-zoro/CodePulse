"use client";

import React, { useEffect } from "react";
import { Check, ChevronsUpDown, PlusCircle, Building } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function WorkspaceSwitcher() {
  const { data: session } = useSession();
  const { workspaces, activeWorkspaceId, setWorkspaces, setActiveWorkspace } = useWorkspaceStore();

  useEffect(() => {
    if (session?.user) {
      fetch("/api/workspaces")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWorkspaces(data);
            if (!activeWorkspaceId && data.length > 0) {
              setActiveWorkspace(data[0].id);
            }
          }
        });
    }
  }, [session, setWorkspaces, activeWorkspaceId, setActiveWorkspace]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between mb-4 border-dashed bg-muted/30">
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4 text-primary" />
            <span className="truncate">{activeWorkspace?.name || "Select Workspace"}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            {workspace.name}
            {activeWorkspaceId === workspace.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
