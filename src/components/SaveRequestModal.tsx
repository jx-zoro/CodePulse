"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Folder } from "lucide-react";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { useTestStore } from "@/lib/store/useTestStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function SaveRequestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { collections, addRequest, updateRequest } = useCollectionsStore();
  const store = useTestStore();
  
  const [name, setName] = useState(store.name || "");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(store.collectionId || collections[0]?.id || "");
  const [selectedFolderId, setSelectedFolderId] = useState<string>(store.folderId || "root");

  useEffect(() => {
    const handleOpen = () => {
      setName(store.name || store.url.split("/").pop() || "New Request");
      setSelectedCollectionId(store.collectionId || collections[0]?.id || "");
      setSelectedFolderId(store.folderId || "root");
      setIsOpen(true);
    };
    window.addEventListener('open-save-request', handleOpen);
    return () => window.removeEventListener('open-save-request', handleOpen);
  }, [store, collections]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!selectedCollectionId) return;

    const requestData = {
      url: store.url,
      method: store.method,
      headers: store.headers,
      params: store.params,
      body: store.body,
      bodyType: store.bodyType,
      authType: store.authType,
      authData: store.authData,
      name,
    };

    if (store.id && store.collectionId === selectedCollectionId && store.folderId === selectedFolderId) {
      // Update existing
      updateRequest(selectedCollectionId, selectedFolderId, store.id, requestData);
      store.setName(name);
    } else {
      // Save as new
      const newId = crypto.randomUUID();
      addRequest(selectedCollectionId, selectedFolderId, { ...requestData, id: newId });
      store.setId(newId);
      store.setName(name);
      store.setCollectionId(selectedCollectionId);
      store.setFolderId(selectedFolderId);
    }
    
    setIsOpen(false);
  };

  const selectedCol = collections.find(c => c.id === selectedCollectionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Save className="h-5 w-5" /> Save Request</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground">Request Name</label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="mt-1"
              placeholder="e.g. Get User Profile"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground">Save to Collection</label>
            <select 
              value={selectedCollectionId}
              onChange={e => {
                setSelectedCollectionId(e.target.value);
                setSelectedFolderId("root");
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {collections.length === 0 && <option value="" disabled>No Collections</option>}
            </select>
          </div>

          {selectedCol && (
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Folder</label>
              <select 
                value={selectedFolderId}
                onChange={e => setSelectedFolderId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
              >
                <option value="root">/</option>
                {/* Simplified flat list of folders for the modal */}
                {selectedCol.root.folders.map(f => (
                  <option key={f.id} value={f.id}>/ {f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedCollectionId || !name.trim()}>Save Request</Button>
        </div>
      </div>
    </div>
  );
}
