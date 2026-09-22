"use client";

import React, { useState, useEffect } from "react";
import { FileJson, X, UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { parseOpenAPI } from "@/lib/api/openapi-parser";
import { useOpenApiStore } from "@/lib/store/useOpenApiStore";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";

export function OpenApiImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [specContent, setSpecContent] = useState("");
  const [specName, setSpecName] = useState("");
  const [error, setError] = useState("");
  
  const { addSpec } = useOpenApiStore();
  const { addCollection, collections, addFolder, addRequest } = useCollectionsStore();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-openapi-import', handleOpen);
    return () => window.removeEventListener('open-openapi-import', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      setError("");
      const { spec, endpoints, requests } = parseOpenAPI(specContent, specName);
      
      addSpec(spec, endpoints);
      
      addCollection(spec.name, "Imported from OpenAPI specification");
      
      setTimeout(() => {
        const state = useCollectionsStore.getState();
        const latestCol = state.collections[state.collections.length - 1];
        
        if (latestCol) {
          requests.forEach(req => {
            addRequest(latestCol.id, "root", { ...req, name: `[Generated] ${req.name}` });
          });
        }
      }, 100);

      setIsOpen(false);
      setSpecContent("");
      setSpecName("");
    } catch (e: any) {
      setError(e.message || "Failed to parse specification");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><UploadCloud className="h-5 w-5 text-primary" /> Import OpenAPI</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Paste your OpenAPI 3.0 JSON specification below. CodePulse will automatically generate an API collection with ready-to-test endpoints.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">API Name (Optional)</label>
            <input 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Leave blank to use spec title"
              value={specName}
              onChange={e => setSpecName(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex-1 min-h-[200px]">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Specification (JSON)</label>
            <textarea 
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono min-h-[300px] resize-y"
              placeholder='{"openapi": "3.0.0", "info": {...}}'
              value={specContent}
              onChange={e => setSpecContent(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!specContent.trim()}>Import & Generate</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
