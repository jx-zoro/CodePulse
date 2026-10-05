"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { Activity, BarChart3, TrendingUp, Zap, Clock, AlertTriangle, CheckCircle2, TrendingDown, ArrowRight, Check, Bug, Search } from "lucide-react";
import { APIRegressionEngine } from "@/lib/core/APIRegressionEngine";
import { useRegressionStore } from "@/lib/store/useRegressionStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/lib/store/useTestStore";
import { useContext } from "react";
import { CopilotContext } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const performanceStore = usePerformanceStore();
  const historyStore = useHistoryStore();
  const regressionStore = useRegressionStore();
  const router = useRouter();
  const testStore = useTestStore();
  const { openCopilot } = useContext(CopilotContext);

  React.useEffect(() => {
    // Run regression engine passively
    if (historyStore.tests.length > 5) {
      const alerts = APIRegressionEngine.analyze(historyStore.tests, performanceStore.baselines || []);
      alerts.forEach(alert => {
        regressionStore.addAlert(alert);
      });
    }
  }, [historyStore.tests]);

  const activeAlerts = regressionStore.alerts.filter(a => a.status === "OPEN");

  const handleInvestigate = (alert: any) => {
    // Find the execution in history and load it
    const execution = historyStore.tests.find(t => t.id === alert.recentExecutionId);
    if (execution) {
      testStore.setUrl(execution.request.url);
      testStore.setMethod(execution.request.method);
      testStore.setHeaders(execution.request.headers || []);
      if (execution.request.body) testStore.setBody(execution.request.body);
      if (execution.response) testStore.setResponse(execution.response);
      router.push("/test");
    }
  };

  const handleCopilot = (alert: any) => {
    const execution = historyStore.tests.find(t => t.id === alert.recentExecutionId);
    if (execution) {
      openCopilot(`🚨 API REGRESSION DETECTED on ${alert.method} ${alert.endpointUrl}. ${alert.metrics.map((m:any) => `${m.name} went from ${m.before} to ${m.after}`).join(', ')}. Analyze this recent execution and tell me why it degraded so badly.`);
    }
  };

  const baselines = performanceStore.baselines || [];
  const tests = historyStore.tests || [];

  const totalExecutions = tests.length;
  const successfulExecutions = tests.filter((t: any) => t.response && t.response.status >= 200 && t.response.status < 300).length;
  const errorExecutions = totalExecutions - successfulExecutions;

  const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : 0;
  const errorRate = totalExecutions > 0 ? ((errorExecutions / totalExecutions) * 100).toFixed(1) : 0;

  const allLatencies = tests.map((t: any) => t.response?.metrics?.totalTime || 0).filter(l => l > 0);
  const avgLatency = allLatencies.length > 0 ? Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics & Regressions</h1>
        <p className="text-muted-foreground mt-1">
          Endpoint latency, success rates, and automated regression intelligence.
        </p>
      </div>

      {activeAlerts.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
            <TrendingDown className="h-5 w-5" /> Active API Regressions
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="border border-destructive/30 bg-destructive/5 rounded-lg overflow-hidden animate-in slide-in-from-top-2">
                <div className="bg-destructive/10 px-4 py-2 border-b border-destructive/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" /> 🚨 API REGRESSION DETECTED
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground">
                    Severity: 
                    <span className={cn("px-2 py-0.5 rounded", alert.severity === "CRITICAL" ? "bg-destructive text-destructive-foreground" : "bg-warning text-warning-foreground")}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Endpoint affected</div>
                      <div className="font-mono text-sm font-semibold flex items-center gap-2 bg-background/50 inline-flex px-2 py-1 rounded border">
                        <span className={cn(
                          alert.method === "GET" && "text-blue-500",
                          alert.method === "POST" && "text-green-500",
                          alert.method === "PUT" && "text-orange-500",
                          alert.method === "DELETE" && "text-red-500",
                        )}>{alert.method}</span>
                        <span>{alert.endpointUrl}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {alert.metrics.map((m, i) => (
                        <div key={i}>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">{m.name}</div>
                          <div className="flex items-center gap-2 font-mono text-sm">
                            <span className="line-through opacity-70">{m.before}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-bold text-destructive">{m.after}</span>
                            {m.deltaPercent && (
                              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1 rounded">
                                {m.deltaPercent > 0 ? '+' : ''}{m.deltaPercent}%
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> First detected: {new Date(alert.detectedAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 shrink-0 md:w-48 border-l pl-6 justify-center">
                    <Button size="sm" onClick={() => handleInvestigate(alert)} className="w-full justify-start">
                      <Search className="h-4 w-4 mr-2" /> Investigate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleCopilot(alert)} className="w-full justify-start border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                      <Bug className="h-4 w-4 mr-2" /> Ask Copilot
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => regressionStore.updateAlertStatus(alert.id, "ACKNOWLEDGED")} className="w-full justify-start text-muted-foreground">
                      <Check className="h-4 w-4 mr-2" /> Acknowledge
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> Execution Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-muted-foreground mt-1">Total requests recorded in history.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-destructive font-medium mr-1">{errorRate}% Error Rate</span> 
              ({errorExecutions} failures)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" /> Average Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <div className="text-3xl font-bold">{avgLatency}</div>
              <div className="text-sm font-medium text-muted-foreground">ms</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all historical requests.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Endpoint Performance Baselines
          </CardTitle>
          <CardDescription>
            Statistical baselines generated from endpoints tested multiple times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {baselines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <h3 className="font-medium text-foreground mb-1">No baselines generated</h3>
              <p className="text-sm">Run an endpoint repeatedly in the API Workspace to generate statistical performance metrics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Endpoint</th>
                    <th className="px-4 py-3 text-right font-medium">Samples</th>
                    <th className="px-4 py-3 text-right font-medium">P50</th>
                    <th className="px-4 py-3 text-right font-medium">P95</th>
                    <th className="px-4 py-3 text-right font-medium">P99</th>
                    <th className="px-4 py-3 text-right font-medium">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {baselines.map((baseline, i) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs max-w-[300px] truncate text-primary" title={baseline.requestId}>
                        {baseline.requestId}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{baseline.sampleCount}</td>
                      <td className="px-4 py-3 text-right font-mono">{Math.round(baseline.p50)}ms</td>
                      <td className="px-4 py-3 text-right font-mono text-warning font-medium">{Math.round(baseline.p95)}ms</td>
                      <td className="px-4 py-3 text-right font-mono text-destructive font-medium">{Math.round(baseline.p99)}ms</td>
                      <td className="px-4 py-3 text-right font-mono">{Math.round(baseline.average)}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

