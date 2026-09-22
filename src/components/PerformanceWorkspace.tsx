"use client";

import React from "react";
import { Activity, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";

export function PerformanceWorkspace({ requestId, totalTime }: { requestId: string, totalTime?: number }) {
  const { getBaselineForRequest } = usePerformanceStore();
  const baseline = getBaselineForRequest(requestId);

  if (!baseline) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed mt-4">
        <Activity className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No Performance Baseline</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Execute this request at least 10 times to generate a statistically significant performance baseline.
        </p>
      </div>
    );
  }

  let regressionWarning = null;
  if (totalTime && totalTime > baseline.p95) {
    const diff = totalTime - baseline.p95;
    const percentage = ((diff / baseline.p95) * 100).toFixed(1);
    regressionWarning = {
      isRegression: true,
      text: `+${percentage}% latency regression vs P95`
    };
  } else if (totalTime && totalTime < baseline.p50) {
    const diff = baseline.p50 - totalTime;
    const percentage = ((diff / baseline.p50) * 100).toFixed(1);
    regressionWarning = {
      isRegression: false,
      text: `-${percentage}% faster than P50`
    };
  }

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-md bg-card">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">P50 Latency</div>
          <div className="text-2xl font-bold">{Math.round(baseline.p50)}ms</div>
        </div>
        <div className="p-4 border rounded-md bg-card">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">P95 Latency</div>
          <div className="text-2xl font-bold">{Math.round(baseline.p95)}ms</div>
        </div>
        <div className="p-4 border rounded-md bg-card">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">P99 Latency</div>
          <div className="text-2xl font-bold text-destructive">{Math.round(baseline.p99)}ms</div>
        </div>
        <div className="p-4 border rounded-md bg-card">
          <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Error Rate</div>
          <div className="text-2xl font-bold text-muted-foreground">{(baseline.errorRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      {totalTime && regressionWarning && (
        <div className={`flex items-center gap-3 p-4 rounded-md border ${regressionWarning.isRegression ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-success/10 border-success/20 text-success'}`}>
          {regressionWarning.isRegression ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          <div>
            <div className="font-semibold text-sm">
              {regressionWarning.isRegression ? "Performance Regression Detected" : "Performance Improved"}
            </div>
            <div className="text-xs opacity-90">{regressionWarning.text}</div>
          </div>
        </div>
      )}
      
      {!totalTime && baseline && (
        <div className="flex items-center gap-3 p-4 rounded-md border bg-muted/20">
          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm text-muted-foreground">
            Run this request to compare current performance against the historical baseline. Based on {baseline.sampleCount} samples.
          </div>
        </div>
      )}
    </div>
  );
}
