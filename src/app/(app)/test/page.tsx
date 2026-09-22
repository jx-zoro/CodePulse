"use client";

import { useState } from "react";
import { Play, Save, ChevronDown, Plus, Trash2, Settings2, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Editor from "@monaco-editor/react";

import { useTestStore } from "@/lib/store/useTestStore";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { resolveVariables } from "@/lib/api/resolver";
import { HttpMethod, AuthType, ApiHeader, QueryParameter } from "@/lib/api/types";
import { PerformanceWorkspace } from "@/components/PerformanceWorkspace";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";
import { DependencyWorkspace } from "@/components/DependencyWorkspace";
import { ContractWorkspace } from "@/components/ContractWorkspace";
import { validateContract } from "@/lib/api/contract-validator";
import { ExtractionWorkspace } from "@/components/ExtractionWorkspace";
import { processExtractions } from "@/lib/api/variable-extractor";
import { TestWorkspace } from "@/components/TestWorkspace";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { runTests } from "@/lib/api/assertion-engine";
import { executeRequest } from "@/lib/api/executor";
import { analyzeResponse } from "@/lib/api/analyzer";
import { useContext } from "react";
import { CopilotContext } from "@/components/layout/AppLayout";

const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
type TabType = "params" | "headers" | "auth" | "body" | "tests" | "extract" | "depend";
type ResponseTabType = "body" | "headers" | "raw" | "tests" | "contract" | "performance";

export default function ApiTesterPage() {
  const { openCopilot, openSdkGenerator } = useContext(CopilotContext);
  const store = useTestStore();
  const envStore = useEnvironmentStore();
  const historyStore = useHistoryStore();
  
  const [activeTab, setActiveTab] = useState<TabType>("params");
  const [responseTab, setResponseTab] = useState<ResponseTabType>("body");
  const { getTestCaseForRequest } = useTestEngineStore();
  const [testResult, setTestResult] = useState<any>(null);
  const [contractResult, setContractResult] = useState<any>(null);

  const activeEnv = envStore.activeEnvironmentId 
    ? envStore.environments.find(e => e.id === envStore.activeEnvironmentId) 
    : null;
  const variables = activeEnv ? [activeEnv.variables] : [];

  const handleSend = async () => {
    store.setIsLoading(true);
    store.setResponse(null);

    // Resolve variables before sending
    const requestToRun = {
      url: resolveVariables(store.url, variables).resolved,
      method: store.method,
      headers: store.headers.map(h => ({ ...h, key: resolveVariables(h.key, variables).resolved, value: resolveVariables(h.value, variables).resolved })),
      params: store.params.map(p => ({ ...p, key: resolveVariables(p.key, variables).resolved, value: resolveVariables(p.value, variables).resolved })),
      body: resolveVariables(store.body, variables).resolved,
      bodyType: store.bodyType,
      authType: store.authType,
      authData: Object.fromEntries(Object.entries(store.authData).map(([k, v]) => [k, resolveVariables(v, variables).resolved]))
    };

    try {
      const response = await executeRequest(requestToRun);
      const { score, insights } = analyzeResponse(response);
      response.insights = insights;
      store.setResponse(response);        // Contract Validation
        const contractRes = validateContract(store.id || "default", requestToRun.url, requestToRun.method, response);
        setContractResult(contractRes);
        if (contractRes && !contractRes.matches) {
          setResponseTab("contract"); // auto switch if mismatch
        }        // Performance Tracking
        usePerformanceStore.getState().addSample({
          id: crypto.randomUUID(),
          requestId: store.id || "default",
          timestamp: new Date().toISOString(),
          totalTime: response.metrics.totalTime,
          statusCode: response.status,
          success: response.status >= 200 && response.status < 300
        });

        // Add to history
      historyStore.addTest({
        id: crypto.randomUUID(),
        request: requestToRun,
        response,
        timestamp: new Date().toISOString(),
        score
      });
    } catch (e) {
      console.error(e);
    } finally {
      store.setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 w-full">
      {/* Request Bar */}
      <div className="flex items-center gap-2 w-full p-2 bg-card border rounded-lg shadow-sm">
        <div className="relative w-32 shrink-0">
          <select 
            className="w-full appearance-none bg-muted/50 border-transparent rounded-md py-2 pl-3 pr-8 text-sm font-semibold focus:ring-1 focus:ring-ring outline-none"
            value={store.method}
            onChange={(e) => store.setMethod(e.target.value as HttpMethod)}
          >
            {methods.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        
        <Input 
          className="flex-1 border-transparent bg-transparent shadow-none focus-visible:ring-0 text-base font-mono"
          placeholder="https://api.example.com/v1/users"
          value={store.url}
          onChange={(e) => store.setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        
        <Button onClick={handleSend} disabled={store.isLoading || !store.url.trim()} className="gap-2 shrink-0">
          <Play className="h-4 w-4" fill="currentColor" />
          {store.isLoading ? "Sending..." : "Send"}
        </Button>
        <Button variant="secondary" onClick={() => window.dispatchEvent(new CustomEvent('open-save-request'))} className="gap-2 shrink-0">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
        {/* Request Configuration Panel */}
        <Card className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="flex items-center border-b px-2 overflow-x-auto">
            {(["params", "headers", "auth", "body", "tests", "extract", "depend"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
                  activeTab === tab 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="p-4 overflow-y-auto flex-1">
            {activeTab === "params" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Query Parameters</p>
                {store.params.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={p.enabled}
                      onChange={(e) => {
                        const newParams = [...store.params];
                        newParams[index].enabled = e.target.checked;
                        store.setParams(newParams);
                      }}
                      className="rounded border-input" 
                    />
                    <Input 
                      placeholder="Key" 
                      value={p.key} 
                      onChange={(e) => {
                        const newParams = [...store.params];
                        newParams[index].key = e.target.value;
                        store.setParams(newParams);
                      }}
                      className="flex-1 font-mono text-sm" 
                    />
                    <Input 
                      placeholder="Value" 
                      value={p.value} 
                      onChange={(e) => {
                        const newParams = [...store.params];
                        newParams[index].value = e.target.value;
                        store.setParams(newParams);
                      }}
                      className="flex-1 font-mono text-sm" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => store.setParams(store.params.filter(param => param.id !== p.id))}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 mt-2"
                  onClick={() => store.setParams([...store.params, { id: crypto.randomUUID(), key: "", value: "", enabled: true }])}
                >
                  <Plus className="h-4 w-4" /> Add Parameter
                </Button>
              </div>
            )}

            {activeTab === "headers" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Request Headers</p>
                {store.headers.map((h, index) => (
                  <div key={h.id} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={h.enabled}
                      onChange={(e) => {
                        const newHeaders = [...store.headers];
                        newHeaders[index].enabled = e.target.checked;
                        store.setHeaders(newHeaders);
                      }}
                      className="rounded border-input" 
                    />
                    <Input 
                      placeholder="Key (e.g. Content-Type)" 
                      value={h.key} 
                      onChange={(e) => {
                        const newHeaders = [...store.headers];
                        newHeaders[index].key = e.target.value;
                        store.setHeaders(newHeaders);
                      }}
                      className="flex-1 font-mono text-sm" 
                    />
                    <Input 
                      placeholder="Value" 
                      value={h.value} 
                      onChange={(e) => {
                        const newHeaders = [...store.headers];
                        newHeaders[index].value = e.target.value;
                        store.setHeaders(newHeaders);
                      }}
                      className="flex-1 font-mono text-sm" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => store.setHeaders(store.headers.filter(header => header.id !== h.id))}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 mt-2"
                  onClick={() => store.setHeaders([...store.headers, { id: crypto.randomUUID(), key: "", value: "", enabled: true }])}
                >
                  <Plus className="h-4 w-4" /> Add Header
                </Button>
              </div>
            )}

            {activeTab === "auth" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Authentication</p>
                <div className="flex gap-4">
                  <select 
                    className="bg-muted/50 border rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                    value={store.authType}
                    onChange={(e) => store.setAuthType(e.target.value as AuthType)}
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>
                
                {store.authType === "bearer" && (
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium">Token</label>
                    <Input 
                      type="password" 
                      placeholder="Enter token" 
                      value={store.authData.token || ""}
                      onChange={(e) => store.setAuthData({ ...store.authData, token: e.target.value })}
                    />
                  </div>
                )}
                
                {store.authType === "basic" && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input 
                        placeholder="Enter username" 
                        value={store.authData.username || ""}
                        onChange={(e) => store.setAuthData({ ...store.authData, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <Input 
                        type="password" 
                        placeholder="Enter password" 
                        value={store.authData.password || ""}
                        onChange={(e) => store.setAuthData({ ...store.authData, password: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "body" && (
              <div className="h-full flex flex-col -m-4">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
                  <select 
                    className="bg-transparent text-sm border rounded px-2 py-1 outline-none text-muted-foreground"
                    value={store.bodyType}
                    onChange={(e) => store.setBodyType(e.target.value as "none" | "json" | "text" | "xml" | "form-url-encoded")}
                  >
                    <option value="none">none</option>
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                  </select>
                </div>
                <div className="flex-1 min-h-[200px]">
                  {store.bodyType !== "none" ? (
                    <Editor
                      height="100%"
                      defaultLanguage={store.bodyType === "json" ? "json" : "plaintext"}
                      theme="vs-dark"
                      value={store.body}
                      onChange={(val) => store.setBody(val || "")}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        tabSize: 2,
                        wordWrap: "on"
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      This request does not have a body.
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "tests" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Test Assertions</p>
                <TestWorkspace requestId={store.id || "default"} />
              </div>
            )}
            {activeTab === "extract" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Extract values from response</p>
                <ExtractionWorkspace requestId={store.id || "default"} />
              </div>
            )}
            {activeTab === "depend" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-2">Request Dependencies</p>
                <DependencyWorkspace requestId={store.id || "default"} />
              </div>
            )}
          </div>
        </Card>

        {/* Response Panel */}
        <Card className="flex-[1.5] flex flex-col h-full overflow-hidden bg-muted/10">
          {!store.response && !store.isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60">
              <Settings2 className="h-16 w-16 mb-4 stroke-[1]" />
              <p className="text-lg font-medium">No Response</p>
              <p className="text-sm">Enter a URL and send a request to see the response.</p>
            </div>
          ) : store.isLoading ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="animate-pulse flex flex-col items-center">
                 <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
                 <p className="text-sm text-muted-foreground">Sending request...</p>
               </div>
             </div>
          ) : store.response ? (
            <>
              {/* Response Header */}
              <div className="flex flex-wrap items-center justify-between border-b px-4 py-3 bg-card gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={cn(
                      "font-semibold flex items-center gap-1.5",
                      store.response.status === 0 && "text-destructive",
                      store.response.status >= 200 && store.response.status < 300 && "text-success",
                      store.response.status >= 400 && store.response.status < 500 && "text-warning",
                      store.response.status >= 500 && "text-destructive"
                    )}>
                      <span className={cn(
                        "h-2 w-2 rounded-full",
                        store.response.status === 0 && "bg-destructive",
                        store.response.status >= 200 && store.response.status < 300 && "bg-success",
                        store.response.status >= 400 && store.response.status < 500 && "bg-warning",
                        store.response.status >= 500 && "bg-destructive"
                      )}></span>
                      {store.response.status === 0 ? "Error" : `${store.response.status} ${store.response.statusText}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-semibold">{store.response.metrics.totalTime} ms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-semibold">{(store.response.size / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>

              {/* Response Tabs */}
              <div className="flex items-center justify-between border-b px-2 bg-card">
                  <div className="flex items-center">
                {(["body", "headers", "raw", "tests", "contract", "performance"] as ResponseTabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setResponseTab(tab)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize",
                      responseTab === tab 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openCopilot({ request: store.url, response: store.response })} 
                    className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/10 mb-1"
                  >
                    <Sparkles className="w-3 h-3 mr-1" /> Explain with Copilot
                  </Button>
              </div>
              </div>

              {/* Response Content */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                
                <div className="flex-[2] overflow-hidden bg-[#1e1e1e]">
                  {responseTab === "body" && (
                    store.response.error ? (
                      <div className="p-6 text-destructive font-mono text-sm">
                        {store.response.error}
                      </div>
                    ) : (
                      <Editor
                        height="100%"
                        defaultLanguage={store.response.contentType.includes("json") ? "json" : "plaintext"}
                        theme="vs-dark"
                        value={
                          store.response.contentType.includes("json") 
                            ? (function() {
                                try {
                                  return JSON.stringify(JSON.parse(store.response.body), null, 2);
                                } catch (e) {
                                  return store.response.body;
                                }
                              })()
                            : store.response.body
                        }
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          wordWrap: "on",
                          fontSize: 13
                        }}
                      />
                    )
                  )}

                  {responseTab === "headers" && (
                     <div className="p-4 overflow-y-auto h-full text-sm font-mono text-[#e5e5e5]">
                       <table className="w-full text-left">
                         <tbody>
                           {Object.entries(store.response.headers).map(([key, value]) => (
                             <tr key={key} className="border-b border-border/10 last:border-0">
                               <td className="py-2 pr-4 text-info align-top whitespace-nowrap">{key}</td>
                               <td className="py-2 break-all">{value}</td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                  )}
                  
                  {responseTab === "raw" && (
                    <div className="p-4 overflow-y-auto h-full text-sm font-mono text-[#e5e5e5] whitespace-pre-wrap break-all">
                      {store.response.body}
                    </div>
                  )}
                </div>
                
                {/* Insights Panel */}
                <div className="flex-1 border-t lg:border-t-0 lg:border-l bg-card p-4 overflow-y-auto">
                  <h3 className="font-semibold text-sm mb-4">Performance Insights</h3>
                  
                  {!store.response.error && (
                    <div className="space-y-4">
                      {/* Performance Score */}
                      <div className="p-4 rounded-lg border flex flex-col items-center justify-center text-center">
                        <span className={cn(
                          "text-3xl font-bold mb-1",
                          store.response.insights.some(i => i.type === "error") ? "text-destructive" :
                          store.response.insights.some(i => i.type === "warning") ? "text-warning" : "text-success"
                        )}>
                          {analyzeResponse(store.response).score}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Performance Score</span>
                      </div>

                      {/* Metric Breakdown */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium pt-2 border-t mt-2">
                          <span>Total Time</span>
                          <span>{store.response.metrics.totalTime} ms</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          * Low-level timings (DNS, TCP, TLS) are estimated or omitted due to browser API limitations in standard fetch. True TTFB may vary.
                        </p>
                      </div>

                      {/* Insights */}
                      {store.response.insights.map(insight => (
                        <div key={insight.id} className={cn(
                          "p-3 rounded-md border mt-4",
                          insight.type === "success" && "bg-success/10 border-success/20",
                          insight.type === "warning" && "bg-warning/10 border-warning/20",
                          insight.type === "error" && "bg-destructive/10 border-destructive/20",
                          insight.type === "info" && "bg-info/10 border-info/20",
                        )}>
                          <h4 className={cn(
                            "text-xs font-semibold mb-1",
                            insight.type === "success" && "text-success",
                            insight.type === "warning" && "text-warning",
                            insight.type === "error" && "text-destructive",
                            insight.type === "info" && "text-info",
                          )}>{insight.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <p className="text-[10px] mt-2 font-medium">Action: {insight.action}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

















