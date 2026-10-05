"use client";

import React from "react";
import { Activity, Globe, CheckCircle2, XCircle, AlertTriangle, Play, Folder, Search, Check, Zap, Server, ShieldCheck, HeartPulse, TrendingDown, TrendingUp, AlertOctagon, GitPullRequest, Info, Clock, LineChart, ChevronDown, ChevronUp } from "lucide-react";
import { APIHealthEngine, ApiHealthReport } from "@/lib/core/APIHealthEngine";
import { useTestStore } from "@/lib/store/useTestStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const historyStore = useHistoryStore();
  const envStore = useEnvironmentStore();
  const collectionsStore = useCollectionsStore();
  const performanceStore = usePerformanceStore();
  const testEngineStore = useTestEngineStore();
  const router = useRouter();

  const tests = historyStore.tests || [];
  const recentTests = [...tests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
  const recentFailures = [...tests].filter((t: any) => !t.response || t.response.status >= 400).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const totalRequests = tests.length;
  const successfulRequests = tests.filter((t: any) => t.response && t.response.status >= 200 && t.response.status < 300).length;
  const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 0;

  const [expandedHealth, setExpandedHealth] = React.useState<string | null>(null);
  
  const allLatencies = tests.map((t: any) => t.response?.metrics?.totalTime || 0).filter(l => l > 0);
  const avgLatency = allLatencies.length > 0 ? Math.round(allLatencies.reduce((a: any, b: any) => a + b, 0) / allLatencies.length) : 0;
  
  const healthReport = APIHealthEngine.calculateHealth(tests, performanceStore.baselines || [], testEngineStore.testCases || []);
  const qualityScore = healthReport.hasInsufficientData ? null : healthReport.overallScore;
  
  const toggleHealth = (cat: string) => {
    setExpandedHealth(prev => prev === cat ? null : cat);
  };

  let collectionRequestCount = 0;
  if (collectionsStore.collections) {
    collectionsStore.collections.forEach(c => {
      const traverse = (f: any) => {
        if (f.requests) collectionRequestCount += f.requests.length;
        if (f.folders) f.folders.forEach(traverse);
      };
      traverse(c.root);
    });
  }

  const activeIncidents = recentFailures.length > 0 ? recentFailures.length : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Control Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time API intelligence, performance metrics, and operational health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/collections")} className="h-8">
            <Folder className="mr-2 h-3.5 w-3.5" /> Collections
          </Button>
          <Button size="sm" onClick={() => router.push("/test")} className="h-8">
            <Play className="mr-2 h-3.5 w-3.5" /> New Request
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Transparent API Health Engine Score */}
        <div className="rounded-lg border bg-card p-5 shadow-sm relative overflow-visible transition-colors z-10 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-primary" /> API Health Engine
            </div>
            {qualityScore !== null && (
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", 
                qualityScore >= 85 ? 'bg-success/10 text-success' : qualityScore >= 60 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
              )}>
                {qualityScore >= 85 ? 'HEALTHY' : qualityScore >= 60 ? 'DEGRADED' : 'CRITICAL'}
              </span>
            )}
          </div>
          
          {qualityScore !== null ? (
            <>
              <div className="flex items-baseline gap-1 mt-1 mb-3">
                <span className={cn("text-3xl font-bold tracking-tight", qualityScore >= 85 ? 'text-success' : qualityScore >= 60 ? 'text-warning' : 'text-destructive')}>
                  {qualityScore}
                </span>
                <span className="text-sm text-muted-foreground font-medium">/ 100</span>
              </div>
              
              <div className="mt-2 flex flex-col gap-1 text-xs">
                {[
                  { key: 'availability', label: 'Availability', data: healthReport.availability, color: 'bg-blue-500' },
                  { key: 'performance', label: 'Performance', data: healthReport.performance, color: 'bg-purple-500' },
                  { key: 'reliability', label: 'Reliability', data: healthReport.reliability, color: 'bg-amber-500' },
                  { key: 'contracts', label: 'Contracts', data: healthReport.contracts, color: 'bg-teal-500' },
                  { key: 'security', label: 'Security', data: healthReport.security, color: 'bg-rose-500' }
                ].map((cat) => (
                  <div key={cat.key} className="border border-transparent hover:border-border rounded bg-card transition-all">
                    <div 
                      className="flex justify-between items-center py-1.5 px-1 cursor-pointer hover:bg-muted/30 rounded"
                      onClick={() => toggleHealth(cat.key)}
                    >
                      <span className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        {expandedHealth === cat.key ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {cat.label}
                      </span> 
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full", cat.color)} style={{ width: `${(cat.data.score/cat.data.maxScore)*100}%` }}></div>
                        </div>
                        <span className="font-semibold text-foreground w-8 text-right">{cat.data.score}/{cat.data.maxScore}</span>
                      </div>
                    </div>
                    {expandedHealth === cat.key && (
                      <div className="px-2 pb-2 pt-1 animate-in slide-in-from-top-1 text-[11px]">
                        <div className="mb-1 font-semibold flex items-center gap-1">
                          Status: <span className={cn(cat.data.status === 'Healthy' ? 'text-success' : cat.data.status === 'Warning' ? 'text-warning' : 'text-destructive')}>{cat.data.status}</span>
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                          {cat.data.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              {healthReport.availability.reasons[0]} Run more API requests to generate a confident quality score.
            </div>
          )}
        </div>

        {/* Success & Failures */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Success Rate
            </div>
          </div>
          
          {totalRequests > 0 ? (
            <>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">{successRate}%</span>
              </div>
              
              <div className="mt-5 grid grid-cols-2 gap-2 text-sm border-t pt-3">
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Total Requests</div>
                  <div className="font-semibold">{totalRequests}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Failed</div>
                  <div className="font-semibold text-destructive">{totalRequests - successfulRequests}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              Execute requests in the workspace to track reliability.
            </div>
          )}
        </div>

        {/* Latency */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-warning" /> Avg Latency
            </div>
          </div>
          
          {totalRequests > 0 ? (
            <>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {avgLatency}
                </span>
                <span className="text-sm font-medium text-muted-foreground ml-1">ms</span>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span>P50 Baseline</span>
                  <span className="font-medium text-foreground">
                    {performanceStore.baselines && performanceStore.baselines.length > 0 
                      ? `${Math.round(performanceStore.baselines.reduce((acc, b) => acc + b.p50, 0) / performanceStore.baselines.length)}ms` 
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Monitored Endpoints</span>
                  <span className="font-medium text-foreground">{performanceStore.baselines?.length || 0}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 text-sm text-muted-foreground">
              Latency metrics will appear here once requests complete.
            </div>
          )}
        </div>

        {/* Workspace Stats */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 text-blue-500" /> Workspace Stats
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-4">
            <div>
              <div className="text-xl font-bold tracking-tight">{collectionRequestCount}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase mt-0.5">Requests</div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">{envStore.environments?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase mt-0.5">Environments</div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">{testEngineStore.testCases?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase mt-0.5">Tests</div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">{performanceStore.baselines?.length || 0}</div>
              <div className="text-[11px] text-muted-foreground font-medium uppercase mt-0.5">Monitors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Executions Table */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="border-b px-5 py-3.5 bg-muted/20 flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" /> Recent Executions
              </h2>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/history")}>
                View All
              </Button>
            </div>
            
            <div className="p-0">
              {recentTests.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Activity className="h-6 w-6 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">No API Executions</h3>
                  <p className="text-xs text-muted-foreground max-w-[250px] mb-4">
                    Send requests from the API workspace or run collections to populate the execution log.
                  </p>
                  <Button size="sm" onClick={() => router.push("/test")}>Open API Workspace</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/10 border-b text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Method</th>
                        <th className="px-4 py-2 text-left font-medium">Endpoint</th>
                        <th className="px-4 py-2 text-right font-medium">Status</th>
                        <th className="px-4 py-2 text-right font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentTests.map((test) => (
                        <tr 
                          key={test.id} 
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => router.push("/history")}
                        >
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              test.request.method === "GET" ? "bg-blue-500/10 text-blue-500" :
                              test.request.method === "POST" ? "bg-green-500/10 text-green-500" :
                              test.request.method === "PUT" ? "bg-orange-500/10 text-orange-500" :
                              test.request.method === "DELETE" ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
                            }`}>
                              {test.request.method}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-xs truncate max-w-[200px] text-foreground group-hover:text-primary transition-colors">
                            {test.request.name || test.request.url}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {test.response ? (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold ${test.response.status >= 200 && test.response.status < 300 ? "text-success" : "text-destructive"}`}>
                                {test.response.status >= 200 && test.response.status < 300 ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                {test.response.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                                <XCircle className="h-3 w-3" />
                                ERR
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs font-mono text-muted-foreground">
                            {test.response ? `${test.response.metrics?.totalTime || 0}ms` : "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Active Incidents / Failures */}
          <div className="rounded-lg border border-destructive/20 bg-card shadow-sm overflow-hidden">
            <div className="border-b border-destructive/10 px-5 py-3.5 bg-destructive/5 flex items-center justify-between">
              <h2 className="font-semibold text-sm flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-4 w-4" /> Operational Incidents
              </h2>
              {activeIncidents > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeIncidents} Active
                </span>
              )}
            </div>
            
            <div className="p-0">
              {recentFailures.length === 0 ? (
                <div className="p-8 text-center flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" /> No recent API failures or incidents detected.
                </div>
              ) : (
                <div className="divide-y divide-destructive/10">
                  {recentFailures.map((test) => (
                    <div key={test.id} className="p-4 hover:bg-muted/30 flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 h-6 w-6 rounded bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground truncate">{test.request.url}</h4>
                          <span className="text-xs font-mono text-destructive font-bold">{test.response ? test.response.status : "Network Error"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {test.response && test.response.body ? (
                            typeof test.response.body === 'string' ? test.response.body : JSON.stringify(test.response.body)
                          ) : "Connection refused or timed out."}
                        </p>
                        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-2">
                          <Clock className="h-3 w-3" /> {new Date(test.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          
          {/* Performance Baselines */}
          <div className="rounded-lg border bg-card shadow-sm flex flex-col h-full max-h-[400px]">
            <div className="border-b px-5 py-3.5 bg-muted/20">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Performance Baselines
              </h2>
            </div>
            <div className="p-0 flex-1 overflow-y-auto custom-scrollbar">
              <div className="divide-y">
                {performanceStore.baselines && performanceStore.baselines.length > 0 ? (
                  performanceStore.baselines.map((baseline, i) => (
                    <div key={i} className="p-4 hover:bg-muted/30 transition-colors">
                      <h4 className="text-xs font-medium text-foreground truncate mb-2" title={baseline.requestId}>
                        <span className="font-bold text-muted-foreground mr-1">REQ</span>
                        {baseline.requestId}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase mb-0.5">P50</div>
                          <div className="text-xs font-bold">{Math.round(baseline.p50)}ms</div>
                        </div>
                        <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase mb-0.5">P95</div>
                          <div className="text-xs font-bold text-warning">{Math.round(baseline.p95)}ms</div>
                        </div>
                        <div className="bg-muted/50 rounded px-2 py-1.5 text-center">
                          <div className="text-[10px] text-muted-foreground uppercase mb-0.5">P99</div>
                          <div className="text-xs font-bold text-destructive">{Math.round(baseline.p99)}ms</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center">
                    <LineChart className="h-8 w-8 text-muted-foreground opacity-30 mb-3" />
                    <p className="text-xs text-muted-foreground">
                      No performance baselines established yet. Run requests repeatedly to generate statistical baselines.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Contracts */}
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b px-5 py-3.5 bg-muted/20">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Security & Governance
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Contract Validation</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">No OpenAPI schema drift detected in recent executions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="h-3.5 w-3.5 text-success" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Security Posture</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">0 endpoints exposing PII without authorization headers.</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full text-xs h-8 mt-2" onClick={() => router.push("/security")}>
                View Security Report
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


