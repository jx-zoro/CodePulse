"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, FileJson } from "lucide-react";
import { ContractResult } from "@/lib/api/types";

export function ContractWorkspace({ contract }: { contract: ContractResult | null }) {
  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed mt-4">
        <FileJson className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No OpenAPI Match</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This endpoint was not found in any imported OpenAPI specifications. 
          Import a spec from the sidebar to enable automatic contract validation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-3 p-4 border rounded-md bg-card">
        {contract.matches ? (
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-success" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium">
            {contract.matches ? "Contract Verified" : "Contract Mismatch"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Matched operation <strong className="font-mono">{contract.method} {contract.path}</strong>
          </p>
        </div>
      </div>

      {!contract.matches && contract.differences.length > 0 && (
        <div className="border border-destructive/20 rounded-md overflow-hidden">
          <div className="bg-destructive/10 px-4 py-2 font-medium text-sm text-destructive border-b border-destructive/20">
            Validation Errors
          </div>
          <ul className="divide-y divide-destructive/10">
            {contract.differences.map((diff, i) => (
              <li key={i} className="px-4 py-3 text-sm flex items-start gap-2">
                <span className="text-destructive font-bold mt-0.5">•</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
