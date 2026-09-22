"use client";

import React, { useState } from "react";
import { Plus, Trash2, Play, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { Button } from "./ui/button";
import { Assertion, AssertionType, TestCase } from "@/lib/api/types";

export function TestWorkspace({ requestId }: { requestId: string }) {
  const { testCases, addTestCase, addAssertion, removeAssertion, updateAssertion } = useTestEngineStore();
  
  let testCase = testCases.find(tc => tc.requestId === requestId);
  
  const handleCreateTest = () => {
    addTestCase({
      id: crypto.randomUUID(),
      requestId,
      name: "Default Test",
      enabled: true,
      assertions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddAssertion = () => {
    if (!testCase) return;
    addAssertion(testCase.id, {
      id: crypto.randomUUID(),
      type: "statusCodeEquals",
      expectedValue: "200",
      enabled: true
    });
  };

  if (!testCase) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed mt-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No tests defined</h3>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Write assertions to verify that your API returns the correct status codes, performance metrics, and data.
        </p>
        <Button onClick={handleCreateTest}>Create Test Case</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Assertions</h3>
        <Button size="sm" variant="outline" onClick={handleAddAssertion}>
          <Plus className="h-4 w-4 mr-2" /> Add Assertion
        </Button>
      </div>

      <div className="border rounded-md divide-y">
        {testCase.assertions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No assertions yet. Click "Add Assertion" to start testing.
          </div>
        ) : (
          testCase.assertions.map(assertion => (
            <div key={assertion.id} className="flex items-center gap-3 p-3 bg-card hover:bg-muted/30 transition-colors">
              <input 
                type="checkbox" 
                checked={assertion.enabled}
                onChange={(e) => updateAssertion(testCase!.id, assertion.id, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-input bg-background text-primary"
              />
              
              <select 
                value={assertion.type}
                onChange={(e) => updateAssertion(testCase!.id, assertion.id, { type: e.target.value as AssertionType })}
                className="h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="statusCodeEquals">Status Code Equals</option>
                <option value="responseTimeLessThan">Response Time Less Than</option>
                <option value="jsonPathEquals">JSON Path Equals</option>
                <option value="jsonPathExists">JSON Path Exists</option>
                <option value="bodyContains">Body Contains Text</option>
                <option value="headerExists">Header Exists</option>
              </select>

              {["jsonPathEquals", "jsonPathExists", "headerExists"].includes(assertion.type) && (
                <input 
                  placeholder="Target (e.g. $.data.id)"
                  value={assertion.target || ""}
                  onChange={(e) => updateAssertion(testCase!.id, assertion.id, { target: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
              )}

              {!["jsonPathExists", "headerExists"].includes(assertion.type) && (
                <input 
                  placeholder="Expected value"
                  value={String(assertion.expectedValue || "")}
                  onChange={(e) => updateAssertion(testCase!.id, assertion.id, { expectedValue: e.target.value })}
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                />
              )}

              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeAssertion(testCase!.id, assertion.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
