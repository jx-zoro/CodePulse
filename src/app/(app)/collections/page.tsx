"use client";

import React, { useState } from "react";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { useTestStore } from "@/lib/store/useTestStore";
import { Button } from "@/components/ui/button";
import { Plus, Folder, FileJson, MoreVertical, Edit2, Trash2, ChevronRight, ChevronDown, Play } from "lucide-react";
import { Collection, CollectionFolder, ApiRequest } from "@/lib/api/types";
import { useRouter } from "next/navigation";

export default function CollectionsPage() {
  const { collections, addCollection } = useCollectionsStore();
  const [newColName, setNewColName] = useState("");

  const handleCreate = () => {
    if (newColName.trim()) {
      addCollection(newColName);
      setNewColName("");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">Organize your API requests into collections and folders.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="New Collection Name..." 
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={newColName}
            onChange={e => setNewColName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="flex-1 border rounded-lg border-dashed flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Folder className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="font-semibold text-lg text-foreground mb-1">No Collections Yet</h3>
          <p className="max-w-sm mb-4">Collections let you group related API requests, define variables, and set up auth once for an entire API.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {collections.map(col => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const { removeCollection, addFolder } = useCollectionsStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/30 px-4 py-3 flex items-center justify-between border-b cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2 font-semibold">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {collection.name}
        </div>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-runner', { detail: { id: collection.id, type: 'collection' } }))}>
            <Play className="h-4 w-4 mr-1 text-primary" /> Run
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addFolder(collection.id, "root", "New Folder")}>
            <Plus className="h-4 w-4 mr-1" /> Folder
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => removeCollection(collection.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-background">
          <FolderTree collectionId={collection.id} folder={collection.root} depth={0} />
          {collection.root.folders.length === 0 && collection.root.requests.length === 0 && (
            <div className="text-sm text-muted-foreground py-2 italic text-center">Empty collection. Add a folder or save a request here.</div>
          )}
        </div>
      )}
    </div>
  );
}

function FolderTree({ collectionId, folder, depth }: { collectionId: string, folder: CollectionFolder, depth: number }) {
  const { removeFolder, addFolder, removeRequest } = useCollectionsStore();
  const { loadRequest } = useTestStore();
  const router = useRouter();
  
  const isRoot = depth === 0;

  return (
    <div className={`flex flex-col w-full ${!isRoot ? "pl-4 border-l ml-2 mt-1" : ""}`}>
      {!isRoot && (
        <div className="flex items-center justify-between py-1.5 group hover:bg-muted/50 rounded px-2 -ml-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Folder className="h-4 w-4 text-muted-foreground fill-muted" />
            {folder.name}
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addFolder(collectionId, folder.id, "New Subfolder")}>
              <Plus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFolder(collectionId, folder.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {folder.folders.map(sub => (
          <FolderTree key={sub.id} collectionId={collectionId} folder={sub} depth={depth + 1} />
        ))}
        
        {folder.requests.map(req => (
          <div key={req.id} className={`flex items-center justify-between py-1.5 group hover:bg-muted/50 rounded px-2 ${isRoot ? "" : "-ml-2 pl-6"}`}>
            <div className="flex items-center gap-2 text-sm">
              <FileJson className="h-4 w-4 text-muted-foreground" />
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                req.method === 'GET' ? 'bg-info/10 text-info' :
                req.method === 'POST' ? 'bg-success/10 text-success' :
                req.method === 'PUT' ? 'bg-warning/10 text-warning' :
                req.method === 'DELETE' ? 'bg-destructive/10 text-destructive' :
                'bg-muted text-muted-foreground'
              }`}>{req.method}</span>
              <span>{req.name || req.url}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => {
                loadRequest(req);
                router.push("/test");
              }}>
                Open
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeRequest(collectionId, folder.id, req.id!)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
