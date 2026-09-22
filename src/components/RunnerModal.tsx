"use client";

import React, { useState, useEffect } from "react";
import { X, Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { runCollection, RunnerProgress } from "@/lib/api/runner";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";

export function RunnerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [targetType, setTargetType] = useState<"collection" | "folder">("collection");
  const [progress, setProgress] = useState<RunnerProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { collections } = useCollectionsStore();

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      setTargetId(customEvent.detail.id);
      setTargetType(customEvent.detail.type);
      setProgress(null);
      setIsOpen(true);
    };
    window.addEventListener('open-runner', handleOpen);
    return () => window.removeEventListener('open-runner', handleOpen);
  }, []);

  if (!isOpen) return null;

  const startRun = async () => {
    let folderToRun = null;
    let colName = "";
    
    if (targetType === "collection") {
      const col = collections.find(c => c.id === targetId);
      if (col) {
        folderToRun = col.root;
        colName = col.name;
      }
    } else {
      // Find folder (simplified: we just assume it's root for now if it's collection)
      const col = collections.find(c => c.id === targetId);
      if (col) {
        folderToRun = col.root;
        colName = col.name;
      }
    }

    if (!folderToRun) return;

    setIsRunning(true);
    setProgress({ total: 1, completed: 0, currentRequest: "Initializing...", results: [] });
    
    await runCollection(folderToRun, (prog) => {
      setProgress(prog);
    });
    
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-3xl h-[70vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Play className="h-5 w-5 text-primary" /> Collection Runner</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} disabled={isRunning}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 flex flex-col gap-6 flex-1 overflow-hidden">
          {!progress && !isRunning && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Play className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Run</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                The collection runner will execute all requests in the folder sequentially, applying the active environment variables.
              </p>
              <Button size="lg" onClick={startRun} className="gap-2">
                <Play className="h-5 w-5" fill="currentColor" /> Start Run
              </Button>
            </div>
          )}

          {progress && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <h3 className="font-semibold text-lg">Execution Progress</h3>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    {isRunning && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    {progress.currentRequest}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{progress.completed} / {progress.total}</div>
                  <div className="text-sm text-muted-foreground">Requests Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%` }}
                />
              </div>

              <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-1">
                {progress.results.map((res, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-md border ${res.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className="flex items-center gap-3">
                      {res.passed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                      <div>
                        <div className="font-medium text-sm">{res.request.name || res.request.url}</div>
                        <div className="text-xs text-muted-foreground">{res.request.method} {res.request.url}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-bold ${res.passed ? 'text-success' : 'text-destructive'}`}>
                        {res.response ? `${res.response.status} ${res.response.statusText}` : 'ERROR'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {res.response ? `${res.response.metrics.totalTime}ms` : res.error}
                      </div>
                    </div>
                  </div>
                ))}
                
                {progress.results.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Waiting for results...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

