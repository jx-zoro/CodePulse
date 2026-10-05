"use client";

import React, { useState, useMemo } from "react";
import { Search, Book, FileJson, Link as LinkIcon, Key, ArrowRight, Server, ShieldCheck, ChevronDown, ChevronRight, Activity, Terminal } from "lucide-react";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiRequest, HttpMethod } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default function DocsPage() {
  const { collections } = useCollectionsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

  // Flatten all endpoints for search and easy access
  const allEndpoints = useMemo(() => {
    const list: { collectionName: string; folderName: string; request: ApiRequest }[] = [];
    collections.forEach(col => {
      // Root requests
      col.root.requests.forEach(req => list.push({ collectionName: col.name, folderName: "Root", request: req }));
      // Folder requests
      col.root.folders.forEach(folder => {
        folder.requests.forEach(req => list.push({ collectionName: col.name, folderName: folder.name, request: req }));
      });
    });
    return list;
  }, [collections]);

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery) return allEndpoints;
    const lowerQuery = searchQuery.toLowerCase();
    return allEndpoints.filter(e => 
      e.request.name?.toLowerCase().includes(lowerQuery) || 
      e.request.url.toLowerCase().includes(lowerQuery) ||
      e.collectionName.toLowerCase().includes(lowerQuery) ||
      e.folderName.toLowerCase().includes(lowerQuery)
    );
  }, [allEndpoints, searchQuery]);

  const selectedEndpoint = allEndpoints.find(e => e.request.id === selectedEndpointId) || (filteredEndpoints.length > 0 ? filteredEndpoints[0] : null);

  const getMethodColor = (method: HttpMethod) => {
    switch(method) {
      case "GET": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "POST": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "PUT": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "DELETE": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "PATCH": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="flex h-full w-full max-w-[1400px] mx-auto overflow-hidden border rounded-xl shadow-sm bg-background">
      
      {/* Sidebar Navigation */}
      <div className="w-80 border-r bg-muted/10 flex flex-col h-full shrink-0">
        <div className="p-4 border-b bg-card">
          <h2 className="font-bold text-lg flex items-center gap-2 tracking-tight">
            <Book className="h-5 w-5 text-primary" /> API Documentation
          </h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search endpoints..." 
              className="pl-9 h-9 text-sm bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {collections.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground text-sm">
              No API definitions found. Import an OpenAPI spec or create a collection.
            </div>
          ) : (
            // Group by Collection
            collections.map(col => {
              const colEndpoints = filteredEndpoints.filter(e => e.collectionName === col.name);
              if (colEndpoints.length === 0 && searchQuery) return null;
              
              return (
                <div key={col.id} className="space-y-1">
                  <h3 className="font-bold text-xs uppercase text-muted-foreground px-2 py-1 tracking-wider">{col.name}</h3>
                  
                  {/* Folders as Subgroups */}
                  {col.root.folders.map(folder => {
                    const folderEndpoints = colEndpoints.filter(e => e.folderName === folder.name);
                    if (folderEndpoints.length === 0) return null;
                    return (
                      <div key={folder.id} className="mb-2">
                        <div className="text-[11px] font-semibold text-foreground px-2 py-1 opacity-70">{folder.name}</div>
                        <ul className="space-y-0.5 border-l-2 border-muted ml-3 pl-1">
                          {folderEndpoints.map(e => (
                            <li key={e.request.id}>
                              <button 
                                onClick={() => setSelectedEndpointId(e.request.id!)}
                                className={cn(
                                  "w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-muted transition-colors",
                                  selectedEndpoint?.request.id === e.request.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                                )}
                              >
                                <span className={cn("font-bold text-[9px] px-1 rounded", getMethodColor(e.request.method))}>
                                  {e.request.method.substring(0, 3)}
                                </span>
                                <span className="truncate">{e.request.name || new URL(e.request.url).pathname}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}

                  {/* Root Endpoints */}
                  {colEndpoints.filter(e => e.folderName === "Root").length > 0 && (
                    <ul className="space-y-0.5">
                      {colEndpoints.filter(e => e.folderName === "Root").map(e => (
                        <li key={e.request.id}>
                          <button 
                            onClick={() => setSelectedEndpointId(e.request.id!)}
                            className={cn(
                              "w-full text-left px-2 py-1.5 rounded text-xs flex items-center gap-2 hover:bg-muted transition-colors",
                              selectedEndpoint?.request.id === e.request.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                            )}
                          >
                            <span className={cn("font-bold text-[9px] px-1 rounded", getMethodColor(e.request.method))}>
                              {e.request.method.substring(0, 3)}
                            </span>
                            <span className="truncate">{e.request.name || new URL(e.request.url).pathname}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
        {selectedEndpoint ? (
          <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-300">
            
            {/* Overview Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <span>{selectedEndpoint.collectionName}</span> <ChevronRight className="h-3 w-3" /> <span>{selectedEndpoint.folderName}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{selectedEndpoint.request.name || "Unnamed Endpoint"}</h1>
              {selectedEndpoint.request.description && (
                <p className="text-lg text-muted-foreground">{selectedEndpoint.request.description}</p>
              )}
              
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border font-mono text-sm mt-6">
                <span className={cn("font-bold px-2 py-0.5 rounded border", getMethodColor(selectedEndpoint.request.method))}>
                  {selectedEndpoint.request.method}
                </span>
                <span className="font-semibold">{selectedEndpoint.request.url}</span>
              </div>
            </section>

            {/* Authentication */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><Key className="h-5 w-5" /> Authentication</h3>
              {selectedEndpoint.request.authType === "none" ? (
                <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-md border border-dashed">No authentication is required for this endpoint.</p>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                  <div className="font-semibold uppercase tracking-wider text-xs text-primary mb-2">Required: {selectedEndpoint.request.authType}</div>
                  <p className="text-sm text-muted-foreground">This endpoint requires {selectedEndpoint.request.authType} authentication. Please ensure your workspace environment variables are configured with the appropriate credentials.</p>
                </div>
              )}
            </section>

            {/* Parameters */}
            {(selectedEndpoint.request.params?.length > 0 || selectedEndpoint.request.headers?.length > 0) && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><Server className="h-5 w-5" /> Parameters & Headers</h3>
                
                {selectedEndpoint.request.params?.filter(p => p.key).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Query Parameters</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Parameter</th>
                            <th className="px-4 py-2 font-semibold">Value / Example</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedEndpoint.request.params.filter(p => p.key).map((p, i) => (
                            <tr key={i} className="bg-card">
                              <td className="px-4 py-2 font-mono font-medium">{p.key}</td>
                              <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{p.value || 'string'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {selectedEndpoint.request.headers?.filter(h => h.key).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">HTTP Headers</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 font-semibold">Header</th>
                            <th className="px-4 py-2 font-semibold">Value / Expected</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedEndpoint.request.headers.filter(h => h.key).map((h, i) => (
                            <tr key={i} className="bg-card">
                              <td className="px-4 py-2 font-mono font-medium">{h.key}</td>
                              <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{h.value || 'string'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Request Body */}
            {selectedEndpoint.request.method !== "GET" && selectedEndpoint.request.bodyType !== "none" && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><FileJson className="h-5 w-5" /> Request Body Schema</h3>
                <div className="bg-slate-950 rounded-md overflow-hidden border border-slate-800 shadow-sm">
                  <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                    <span>Content-Type: application/json</span>
                    <span>Example</span>
                  </div>
                  <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {selectedEndpoint.request.body || "{\n  // Payload required\n}"}
                  </pre>
                </div>
              </section>
            )}

            {/* Response & Errors */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2"><Activity className="h-5 w-5" /> Responses & Status Codes</h3>
              
              <div className="grid gap-4">
                <div className="border border-success/30 bg-success/5 rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-success">
                    <div className="bg-success text-success-foreground px-2 py-0.5 rounded text-xs">200 OK</div>
                    <span>Success Response</span>
                  </div>
                  <p className="text-sm text-muted-foreground">The request was successfully processed by the server.</p>
                </div>

                <div className="border border-warning/30 bg-warning/5 rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-warning">
                    <div className="bg-warning text-warning-foreground px-2 py-0.5 rounded text-xs">400 Bad Request</div>
                    <span>Validation Error</span>
                  </div>
                  <p className="text-sm text-muted-foreground">The server cannot process the request due to malformed syntax or missing required parameters.</p>
                </div>

                <div className="border border-destructive/30 bg-destructive/5 rounded-md p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-destructive">
                    <div className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded text-xs">401 Unauthorized</div>
                    <span>Authentication Failure</span>
                  </div>
                  <p className="text-sm text-muted-foreground">The request requires user authentication. Ensure your tokens or API keys are valid.</p>
                </div>
              </div>
            </section>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Book className="h-16 w-16 mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-foreground">API Reference Documentation</h2>
            <p className="max-w-md text-center mt-2 text-sm">
              Select an endpoint from the sidebar to view its full documentation, schemas, and examples.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
