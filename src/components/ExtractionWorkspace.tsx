"use client";

import React from "react";
import { Plus, Trash2, Database } from "lucide-react";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { Button } from "./ui/button";

export function ExtractionWorkspace({ requestId }: { requestId: string }) {
  const { extractedVariables, addExtractedVariable, removeExtractedVariable, updateExtractedVariable, getExtractedVariablesForRequest } = useTestEngineStore();
  
  const requestExtractions = getExtractedVariablesForRequest(requestId);
  
  const handleAddExtraction = () => {
    addExtractedVariable({
      id: crypto.randomUUID(),
      requestId,
      variableName: "new_variable",
      source: "jsonPath",
      target: "$.data.id",
      enabled: true
    });
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Extraction</h3>
        <Button size="sm" variant="outline" onClick={handleAddExtraction}>
          <Plus className="h-4 w-4 mr-2" /> Add Extraction
        </Button>
      </div>

      <div className="border rounded-md divide-y">
        {requestExtractions.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center">
            <Database className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground max-w-md">
              Extract values from the response and save them to your active environment variables for request chaining.
            </p>
          </div>
        ) : (
          requestExtractions.map(extraction => (
            <div key={extraction.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-card hover:bg-muted/30 transition-colors">
              <input 
                type="checkbox" 
                checked={extraction.enabled}
                onChange={(e) => updateExtractedVariable(extraction.id, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-input bg-background text-primary"
              />
              
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="text-sm font-mono text-muted-foreground">var</span>
                <input 
                  placeholder="variableName"
                  value={extraction.variableName}
                  onChange={(e) => updateExtractedVariable(extraction.id, { variableName: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-mono"
                />
              </div>

              <select 
                value={extraction.source}
                onChange={(e) => updateExtractedVariable(extraction.id, { source: e.target.value as any })}
                className="h-9 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="jsonPath">JSON Path</option>
                <option value="header">Header</option>
                <option value="regex">Regex</option>
                <option value="statusCode">Status Code</option>
                <option value="responseTime">Response Time</option>
              </select>

              {!["statusCode", "responseTime"].includes(extraction.source) && (
                <input 
                  placeholder="Target (e.g. $.data.id)"
                  value={extraction.target}
                  onChange={(e) => updateExtractedVariable(extraction.id, { target: e.target.value })}
                  className="h-9 flex-1 min-w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
              )}

              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeExtractedVariable(extraction.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
