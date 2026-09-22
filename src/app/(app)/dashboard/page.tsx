"use client";

import React, { useEffect, useState } from "react";
import { Activity, Globe, CheckCircle2, XCircle, AlertTriangle, Play, Folder, Search, Check, Zap, Server, ShieldCheck, HeartPulse, TrendingDown, TrendingUp } from "lucide-react";
import { useTestStore } from "@/lib/store/useTestStore";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useEnvironmentStore } from "@/lib/store/useEnvironmentStore";
import { useCollectionsStore } from "@/lib/store/useCollectionsStore";
import { usePerformanceStore } from "@/lib/store/usePerformanceStore";
import { useTestEngineStore } from "@/lib/store/useTestEngineStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const historyStore = useHistoryStore();
  const envStore = useEnvironmentStore();
  const collectionsStore = useCollectionsStore();
  const performanceStore = usePerformanceStore();
  const testEngineStore = useTestEngineStore();
  const router = useRouter();

  const tests = historyStore.tests;
  const recentTests = [...tests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  const totalRequests = tests.length;
  const successfulRequests = tests.filter((t: any) => t.response && t.response.status >= 200 && t.response.status < 300).length;
  const successRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100;

  let qualityScore = 100;
  let testReliability = 25;
  let performanceHealth = 25;
  let availability = 25;
  let contractHealth = 25;

  if (totalRequests > 0) {
    availability = Math.round((successRate / 100) * 25);
    
    const allLatencies = tests.map((t: any) => t.response?.metrics.totalTime || 0);
    const avgLatency = allLatencies.reduce((a: any, b: any) => a + b, 0) / allLatencies.length;
    performanceHealth = avgLatency > 1000 ? 5 : avgLatency > 500 ? 15 : 25;

    const testCases = testEngineStore.testCases;
    if (testCases.length > 0) {
       testReliability = Math.round((successRate / 100) * 25);
    }

    qualityScore = availability + performanceHealth + testReliability + contractHealth;
  }

  let collectionRequestCount = 0;
  collectionsStore.collections.forEach(c => {
    const traverse = (f: any) => {
      collectionRequestCount += f.requests.length;
      f.folders.forEach(traverse);
    };
    traverse(c.root);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CodePulse Control Center</h1>
          <p className="text-muted-foreground mt-1">
            Real-time API intelligence, testing, and performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/collections")}>
            <Folder className="mr-2 h-4 w-4" /> Collections
          </Button>
          <Button onClick={() => router.push("/test")}>
            <Play className="mr-2 h-4 w-4" /> New Request
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div className="absolute right-0 top-0 opacity-5 p-6 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
            <HeartPulse className="h-24 w-24" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <HeartPulse className="h-4 w-4 text-primary" /> API Quality Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${qualityScore > 90 ? 'text-success' : qualityScore > 70 ? 'text-warning' : 'text-destructive'}`}>{qualityScore}</span>
            <span className="text-sm text-muted-foreground font-medium">/ 100</span>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Availability</span> <span className="font-medium text-foreground">{availability}/25</span></div>
            <div className="flex justify-between"><span>Performance</span> <span className="font-medium text-foreground">{performanceHealth}/25</span></div>
            <div className="flex justify-between"><span>Reliability</span> <span className="font-medium text-foreground">{testReliability}/25</span></div>
            <div className="flex justify-between"><span>Contracts</span> <span className="font-medium text-foreground">{contractHealth}/25</span></div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <CheckCircle2 className="h-4 w-4 text-success" /> Success Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{successRate}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Based on {totalRequests} historical executions.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Zap className="h-4 w-4 text-warning" /> Latency (P50)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {performanceStore.baselines.length > 0 
                ? Math.round(performanceStore.baselines.reduce((acc, b) => acc + b.p50, 0) / performanceStore.baselines.length) 
                : "--"}
              <span className="text-xl ml-1">ms</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Average P50 across {performanceStore.baselines.length} baselined endpoints.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
            <Server className="h-4 w-4 text-blue-500" /> Workspaces
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-2xl font-bold">{collectionRequestCount}</div>
              <div className="text-xs text-muted-foreground">Requests</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{envStore.environments.length}</div>
              <div className="text-xs text-muted-foreground">Environments</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{testEngineStore.testCases.length}</div>
              <div className="text-xs text-muted-foreground">Tests</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{performanceStore.baselines.length}</div>
              <div className="text-xs text-muted-foreground">Monitors</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card shadow-sm flex flex-col">
          <div className="border-b px-6 py-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> API Insights Center
            </h2>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y">
              {performanceStore.baselines.map((baseline, i) => (
                <div key={i} className="p-4 flex items-start gap-4 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingDown className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Performance Baseline Generated</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Endpoint has enough samples. P95 latency is {Math.round(baseline.p95)}ms with a {Math.round(baseline.successRate * 100)}% success rate.
                    </p>
                  </div>
                </div>
              ))}

              {performanceStore.baselines.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Run endpoints multiple times to generate data-backed performance and regression insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm flex flex-col">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Recent Executions
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>View All</Button>
          </div>
          <div className="p-0 flex-1">
            <div className="divide-y">
              {recentTests.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  No requests executed yet.
                </div>
              ) : (
                recentTests.map((test) => (
                  <div 
                    key={test.id} 
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => router.push("/history")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`text-xs font-bold w-12 text-right ${
                        test.request.method === "GET" ? "text-blue-500" :
                        test.request.method === "POST" ? "text-green-500" :
                        test.request.method === "PUT" ? "text-orange-500" :
                        test.request.method === "DELETE" ? "text-red-500" : "text-muted-foreground"
                      }`}>
                        {test.request.method}
                      </div>
                      <div className="font-medium text-sm truncate max-w-[200px] md:max-w-[300px]">
                        {test.request.name || test.request.url}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-muted-foreground font-mono w-16 text-right">
                        {test.response ? `${test.response.metrics.totalTime}ms` : "Err"}
                      </div>
                      {test.response ? (
                        <div className={`flex items-center gap-1 font-bold ${test.response.status >= 200 && test.response.status < 300 ? "text-success" : "text-destructive"}`}>
                          {test.response.status >= 200 && test.response.status < 300 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          {test.response.status}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 font-bold text-destructive">
                          <XCircle className="h-4 w-4" />
                          Fail
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


