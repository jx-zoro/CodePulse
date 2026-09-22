"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Variable } from "@/lib/api/types";

export function EnvironmentManagerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { environments, addEnvironment, updateEnvironment, removeEnvironment, addVariable, updateVariable, removeVariable } = useEnvironmentStore();
  
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-env-manager', handleOpen);
    return () => window.removeEventListener('open-env-manager', handleOpen);
  }, []);

  if (!isOpen) return null;

  const selectedEnv = environments.find(e => e.id === selectedEnvId) || environments[0];

  const handleCreateEnv = () => {
    const id = crypto.randomUUID();
    addEnvironment({ id, name: "New Environment", type: "custom", variables: [], createdAt: new Date().toISOString() });
    setSelectedEnvId(id);
  };

  const handleAddVar = () => {
    if (!selectedEnv) return;
    addVariable(selectedEnv.id, { id: crypto.randomUUID(), key: "", value: "", type: "default", enabled: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">Manage Environments</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/20 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-semibold text-sm">Environments</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateEnv}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {environments.map(env => (
                <button
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md mb-1 hover:bg-muted ${selectedEnv?.id === env.id ? 'bg-primary/10 text-primary font-medium' : ''}`}
                >
                  {env.name}
                </button>
              ))}
              {environments.length === 0 && (
                <div className="text-xs text-muted-foreground p-4 text-center">No environments found.</div>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedEnv ? (
              <>
                <div className="p-6 border-b flex flex-col gap-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Environment Name</label>
                      <Input 
                        value={selectedEnv.name} 
                        onChange={(e) => updateEnvironment(selectedEnv.id, { name: e.target.value })}
                        className="mt-1 font-medium"
                      />
                    </div>
                    <div className="w-48">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
                      <select 
                        value={selectedEnv.type}
                        onChange={(e) => updateEnvironment(selectedEnv.id, { type: e.target.value as "development" | "staging" | "production" | "custom" })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-1"
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Variables</h3>
                    <Button variant="outline" size="sm" onClick={handleAddVar}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variable
                    </Button>
                  </div>
                  
                  <div className="border rounded-md">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="w-10 px-3 py-2"></th>
                          <th className="px-3 py-2 font-medium">Variable</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Initial Value</th>
                          <th className="w-12 px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEnv.variables.map(v => (
                          <VariableRow key={v.id} envId={selectedEnv.id} variable={v} />
                        ))}
                        {selectedEnv.variables.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground border-b border-dashed">
                              No variables defined. Click &quot;Add Variable&quot; to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="p-4 border-t bg-muted/10 flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => removeEnvironment(selectedEnv.id)}>
                    Delete Environment
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select or create an environment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VariableRow({ envId, variable }: { envId: string, variable: Variable }) {
  const { updateVariable, removeVariable } = useEnvironmentStore();
  const [showSecret, setShowSecret] = useState(false);

  return (
    <tr className="border-b last:border-0 group">
      <td className="px-3 py-2 align-top pt-3">
        <input 
          type="checkbox" 
          checked={variable.enabled} 
          onChange={(e) => updateVariable(envId, variable.id, { enabled: e.target.checked })}
          className="rounded border-muted-foreground/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
        />
      </td>
      <td className="px-3 py-2">
        <Input 
          value={variable.key} 
          onChange={(e) => updateVariable(envId, variable.id, { key: e.target.value })}
          placeholder="API_KEY"
          className="h-8 font-mono text-sm"
        />
      </td>
      <td className="px-3 py-2">
        <select 
          value={variable.type}
          onChange={(e) => updateVariable(envId, variable.id, { type: e.target.value as "default" | "secret" })}
          className="flex h-8 w-[100px] rounded-md border border-input bg-background px-2 py-1 text-xs"
        >
          <option value="default">Default</option>
          <option value="secret">Secret</option>
        </select>
      </td>
      <td className="px-3 py-2">
        <div className="relative">
          <Input 
            value={variable.value} 
            onChange={(e) => updateVariable(envId, variable.id, { value: e.target.value })}
            placeholder="Value"
            type={variable.type === "secret" && !showSecret ? "password" : "text"}
            className="h-8 pr-8"
          />
          {variable.type === "secret" && (
            <button 
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-right">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity" onClick={() => removeVariable(envId, variable.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
