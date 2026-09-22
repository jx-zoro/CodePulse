import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Collection, ApiRequest, CollectionFolder, Variable } from "../api/types";

interface CollectionsState {
  collections: Collection[];
  addCollection: (name: string, description?: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  
  // Folders
  addFolder: (collectionId: string, parentFolderId: string, name: string) => void;
  removeFolder: (collectionId: string, folderId: string) => void;
  renameFolder: (collectionId: string, folderId: string, newName: string) => void;

  // Requests
  addRequest: (collectionId: string, folderId: string, request: ApiRequest) => void;
  updateRequest: (collectionId: string, folderId: string, requestId: string, updates: Partial<ApiRequest>) => void;
  removeRequest: (collectionId: string, folderId: string, requestId: string) => void;
}

// Helper to recursively map over folders to find and update a specific folder
const updateFolderRecursively = (
  folder: CollectionFolder,
  targetId: string,
  updater: (f: CollectionFolder) => CollectionFolder
): CollectionFolder => {
  if (folder.id === targetId) {
    return updater(folder);
  }
  return {
    ...folder,
    folders: folder.folders.map(f => updateFolderRecursively(f, targetId, updater))
  };
};

// Helper to recursively remove a folder from anywhere in the tree
const removeFolderRecursively = (folder: CollectionFolder, targetId: string): CollectionFolder => {
  return {
    ...folder,
    folders: folder.folders
      .filter(f => f.id !== targetId)
      .map(f => removeFolderRecursively(f, targetId))
  };
};

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set) => ({
      collections: [],
      
      addCollection: (name, description) => {
        const newCol: Collection = {
          id: crypto.randomUUID(),
          name,
          description,
          variables: [],
          authType: "none",
          authData: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          root: { id: "root", name: "Root", folders: [], requests: [] }
        };
        set((state) => ({ collections: [...state.collections, newCol] }));
      },
      
      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),
        
      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),
        
      addFolder: (collectionId, parentFolderId, name) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId) return c;
            const newFolder: CollectionFolder = { id: crypto.randomUUID(), name, folders: [], requests: [] };
            return {
              ...c,
              root: updateFolderRecursively(c.root, parentFolderId, f => ({
                ...f, folders: [...f.folders, newFolder]
              }))
            };
          })
        })),
        
      removeFolder: (collectionId, folderId) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId || folderId === "root") return c;
            return { ...c, root: removeFolderRecursively(c.root, folderId) };
          })
        })),
        
      renameFolder: (collectionId, folderId, newName) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId) return c;
            return {
              ...c,
              root: updateFolderRecursively(c.root, folderId, f => ({ ...f, name: newName }))
            };
          })
        })),
        
      addRequest: (collectionId, folderId, request) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId) return c;
            // ensure the request has an ID
            const req = { ...request, id: request.id || crypto.randomUUID(), collectionId, folderId };
            return {
              ...c,
              root: updateFolderRecursively(c.root, folderId, f => ({
                ...f, requests: [...f.requests, req]
              }))
            };
          })
        })),
        
      updateRequest: (collectionId, folderId, requestId, updates) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId) return c;
            return {
              ...c,
              root: updateFolderRecursively(c.root, folderId, f => ({
                ...f,
                requests: f.requests.map(r => r.id === requestId ? { ...r, ...updates } : r)
              }))
            };
          })
        })),
        
      removeRequest: (collectionId, folderId, requestId) =>
        set((state) => ({
          collections: state.collections.map(c => {
            if (c.id !== collectionId) return c;
            return {
              ...c,
              root: updateFolderRecursively(c.root, folderId, f => ({
                ...f,
                requests: f.requests.filter(r => r.id !== requestId)
              }))
            };
          })
        })),
    }),
    {
      name: "codepulse-collections-v2",
    }
  )
);
