"use client";

import React from "react";
import { GitMerge, ArrowRight, Database } from "lucide-react";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";

export function DependencyWorkspace({ requestId }: { requestId: string }) {
  const { extractedVariables } = useTestEngineStore();
  const { collections } = useCollectionsStore();
  
  const extractions = extractedVariables.filter(ev => ev.requestId === requestId);
  
  const dependents: { reqName: string; varName: string }[] = [];
  
  if (extractions.length > 0) {
    collections.forEach(col => {
      const traverse = (folder: any) => {
        folder.requests.forEach((r: any) => {
          if (r.id === requestId) return;
          
          extractions.forEach(ext => {
            const pattern = `{{${ext.variableName}}}`;
            const usesVar = 
              r.url.includes(pattern) || 
              r.body.includes(pattern) || 
              r.headers.some((h: any) => h.value.includes(pattern)) ||
              r.params.some((p: any) => p.value.includes(pattern));
              
            if (usesVar) {
              dependents.push({ reqName: r.name || r.url, varName: ext.variableName });
            }
          });
        });
        folder.folders.forEach(traverse);
      };
      traverse(col.root);
    });
  }

  if (extractions.length === 0 && dependents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed mt-4">
        <GitMerge className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No Dependencies</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Extract variables from this request to see what other requests depend on it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="p-6 border rounded-md bg-card overflow-x-auto">
        <div className="flex flex-col items-center min-w-max">
          
          <div className="px-6 py-3 bg-primary/10 text-primary border border-primary/30 rounded-lg font-semibold shadow-sm">
            Current Request
          </div>

          {extractions.length > 0 && (
            <>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex gap-4">
                {extractions.map(ext => (
                  <div key={ext.id} className="flex flex-col items-center">
                    <div className="px-4 py-2 bg-muted rounded border flex items-center gap-2 text-sm">
                      <Database className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono text-muted-foreground">{ext.variableName}</span>
                    </div>
                    
                    {dependents.filter(d => d.varName === ext.variableName).length > 0 && (
                      <>
                        <div className="h-8 w-px bg-border"></div>
                        <div className="flex flex-col gap-2">
                          {dependents.filter(d => d.varName === ext.variableName).map((dep, i) => (
                            <div key={i} className="px-4 py-2 bg-card border rounded shadow-sm text-sm flex items-center gap-2">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              {dep.reqName}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
