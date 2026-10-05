"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { FileJson, Link as LinkIcon, Upload, CheckCircle2, AlertTriangle, Search, Play, Activity, History, BookOpen, Sparkles, Folder, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseOpenAPI, ParsedApi } from "@/lib/utils/openapiParser";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { useTestStore } from "@/lib/store/useTestStore";
import { CopilotContext } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState("paste");
  const [inputData, setInputData] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedApi, setParsedApi] = useState<ParsedApi | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCollectionId, setImportedCollectionId] = useState<string | null>(null);

  const { addCollection, addFolder, addRequest, collections } = useCollectionsStore();
  const testStore = useTestStore();
  const router = useRouter();
  const { openCopilot } = useContext(CopilotContext);

  const handleParse = async () => {
    setError(null);
    try {
      let contentToParse = inputData;
      if (activeTab === "url") {
        if (!url) throw new Error("Please provide a valid URL.");
        // Simulated fetch for URL to bypass CORS in this demo
        throw new Error("URL importing is disabled due to strict CORS. Please paste the raw JSON instead.");
      }
      
      if (!contentToParse.trim()) throw new Error("Please provide an OpenAPI specification.");
      
      const parsed = parseOpenAPI(contentToParse);
      setParsedApi(parsed);
    } catch (err: any) {
      setError(err.message || "Failed to parse OpenAPI specification.");
    }
  };

  const handleImportToWorkspace = () => {
    if (!parsedApi) return;
    setIsImporting(true);

    try {
      // Create collection
      const collectionName = parsedApi.info.title;
      addCollection(collectionName);
      
      // Zustand doesn't return the ID synchronously from addCollection easily without hacking,
      // so we find the newly created collection by assuming it's the last one or by name matching.
      setTimeout(() => {
        const latestCollections = useCollectionsStore.getState().collections;
        const newCol = latestCollections.find(c => c.name === collectionName);
        if (!newCol) throw new Error("Failed to map collection.");
        
        setImportedCollectionId(newCol.id);
        
        // Map Tags to Folders
        const tagToFolderId: Record<string, string> = {};
        parsedApi.tags.forEach(tag => {
          // addFolder (collectionId, parentId, name)
          addFolder(newCol.id, "root", tag);
        });

        setTimeout(() => {
          const updatedCol = useCollectionsStore.getState().collections.find(c => c.id === newCol.id);
          if (!updatedCol) return;
          
          updatedCol.root.folders.forEach(f => {
            tagToFolderId[f.name] = f.id;
          });

          // Add requests
          parsedApi.requests.forEach(req => {
            const fId = req.folderId ? (tagToFolderId[req.folderId] || "root") : "root";
            addRequest(newCol.id, fId, {
              ...req,
              folderId: fId,
              collectionId: newCol.id
            });
          });
          
          setIsImporting(false);
        }, 100);
      }, 100);
      
    } catch (e: any) {
      setError(e.message);
      setIsImporting(false);
    }
  };

  const handleAction = (req: any, action: string) => {
    if (action === "try") {
      testStore.setUrl(req.url);
      testStore.setMethod(req.method);
      testStore.setHeaders(req.headers || []);
      if (req.body) testStore.setBody(req.body);
      router.push("/test");
    } else if (action === "copilot") {
      openCopilot(`Analyze this endpoint: ${req.method} ${req.url}. What are its primary failure modes?`);
    } else if (action === "generate") {
      openCopilot(`Generate validation tests for this endpoint: ${req.method} ${req.url}. Provide assertions for status code, schema, and latency.`);
    } else if (action === "health") {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto h-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Discovery & Import</h1>
        <p className="text-muted-foreground mt-1">
          Import an OpenAPI specification to automatically generate an interactive engineering workspace.
        </p>
      </div>

      {!parsedApi ? (
        <Card>
          <CardHeader>
            <div className="flex space-x-4 border-b pb-2 mb-2">
              <button 
                onClick={() => setActiveTab("paste")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "paste" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Paste JSON
              </button>
              <button 
                onClick={() => setActiveTab("url")}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === "url" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Import via URL
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTab === "paste" && (
              <div className="space-y-2">
                <textarea 
                  className="w-full h-64 bg-muted/50 border rounded-md p-4 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-shadow resize-none"
                  placeholder='{ "openapi": "3.0.0", "info": { ... } }'
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                ></textarea>
              </div>
            )}
            
            {activeTab === "url" && (
              <div className="space-y-2 py-8">
                <div className="flex items-center gap-2">
                  <Input 
                    type="url" 
                    placeholder="https://api.example.com/openapi.json" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleParse} className="w-full">
              Discover Endpoints
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{parsedApi.info.title} <span className="text-sm font-normal text-muted-foreground ml-2">v{parsedApi.info.version}</span></h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Discovered {parsedApi.requests.length} endpoints across {parsedApi.tags.length} groups.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => { setParsedApi(null); setImportedCollectionId(null); }}>Cancel</Button>
                <Button onClick={handleImportToWorkspace} disabled={isImporting || !!importedCollectionId} className={importedCollectionId ? "bg-success hover:bg-success" : ""}>
                  {importedCollectionId ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Imported to Workspace</>
                  ) : isImporting ? (
                    "Importing..."
                  ) : (
                    "Create API Workspace"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {importedCollectionId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Interactive API Workspace</h3>
                <Button variant="outline" size="sm" onClick={() => router.push("/collections")}>
                  View in Collections <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div className="grid gap-3">
                {parsedApi.requests.map((req, i) => (
                  <div key={i} className="border bg-card rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            req.method === "GET" ? "bg-blue-500/10 text-blue-500" :
                            req.method === "POST" ? "bg-green-500/10 text-green-500" :
                            req.method === "PUT" ? "bg-orange-500/10 text-orange-500" :
                            req.method === "DELETE" ? "bg-red-500/10 text-red-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {req.method}
                          </span>
                          <span className="font-mono text-sm font-semibold">{req.url}</span>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                          {req.folderId && <><Folder className="h-3 w-3" /> {req.folderId}</>}
                          <span className="opacity-50">|</span>
                          {req.name}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => handleAction(req, "try")}>
                          <Play className="h-3 w-3 mr-1" /> Try It
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction(req, "generate")}>
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Gen Tests
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAction(req, "health")}>
                          <Activity className="h-3 w-3 mr-1" /> Health
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs bg-primary/5 text-primary hover:bg-primary/10 border-primary/20" onClick={() => handleAction(req, "copilot")}>
                          <Sparkles className="h-3 w-3 mr-1" /> Copilot
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
