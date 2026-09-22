"use client";

import React, { useState, useEffect } from "react";
import { Search, Folder, FileJson, Activity, X } from "lucide-react";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { useTestStore } from "@/lib/store/useTestStore";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { Collection, CollectionFolder, ApiRequest } from "@/lib/api/types";

export function CommandPaletteModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { collections } = useCollectionsStore();
  const { loadRequest } = useTestStore();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  // Flatten the entire collection tree for searching
  const searchableItems: { type: string; title: string; subtitle?: string; icon: React.ReactNode; onSelect: () => void }[] = [];

  const traverseFolder = (folder: CollectionFolder, col: Collection, path: string) => {
    // Add folder
    if (folder.id !== "root") {
      searchableItems.push({
        type: "Folder",
        title: folder.name,
        subtitle: `In ${col.name} ${path}`,
        icon: <Folder className="h-4 w-4 text-muted-foreground" />,
        onSelect: () => { router.push("/collections"); setIsOpen(false); }
      });
    }

    // Add requests
    folder.requests.forEach((req) => {
      searchableItems.push({
        type: "Request",
        title: req.name || req.url,
        subtitle: `${req.method} • ${col.name} ${path}`,
        icon: <FileJson className="h-4 w-4 text-muted-foreground" />,
        onSelect: () => {
          loadRequest(req);
          router.push("/test");
          setIsOpen(false);
        }
      });
    });

    // Traverse subfolders
    folder.folders.forEach(sub => traverseFolder(sub, col, `${path} / ${folder.name}`));
  };

  collections.forEach(col => {
    searchableItems.push({
      type: "Collection",
      title: col.name,
      subtitle: col.description || "Workspace Collection",
      icon: <Activity className="h-4 w-4 text-primary" />,
      onSelect: () => { router.push("/collections"); setIsOpen(false); }
    });
    traverseFolder(col.root, col, "");
  });

  const filtered = query.trim() === "" 
    ? searchableItems.slice(0, 10) 
    : searchableItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center border-b px-4 py-2">
          <Search className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <input 
            autoFocus
            className="flex h-12 w-full bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground"
            placeholder="Search collections, folders, and requests..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:bg-muted p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Results
              </div>
              {filtered.map((item, i) => (
                <button 
                  key={i} 
                  className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-md hover:bg-muted/50 focus:bg-muted outline-none transition-colors group"
                  onClick={item.onSelect}
                >
                  <div className="bg-muted p-2 rounded-md group-hover:bg-background transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{item.title}</span>
                    <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {item.type}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-muted/30 px-4 py-2 text-xs text-muted-foreground border-t flex justify-between">
          <span>Use <kbd className="px-1 py-0.5 bg-muted rounded border">↑</kbd> <kbd className="px-1 py-0.5 bg-muted rounded border">↓</kbd> to navigate (coming soon)</span>
          <span><kbd className="px-1 py-0.5 bg-muted rounded border">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}


