"use client";

import { useState } from "react";
import { GitPullRequest, CheckCircle2, XCircle, Clock, AlertTriangle, Play } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReleasesPage() {
  const [releases] = useState<any[]>([]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Release Management</h1>
          <p className="text-muted-foreground">Manage versions, quality gates, and deployments</p>
        </div>
        <Button className="gap-2">
          <GitPullRequest className="h-4 w-4" />
          New Release
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Tests</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">Pass rate (Target &gt; 95%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Security</CardTitle>
            <ShieldCheckIcon className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">0 Critical Vulnerabilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Contracts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">1 Breaking change detected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Release History</CardTitle>
          <CardDescription>Track the lifecycle of your API versions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {releases.map((release) => (
              <div key={release.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-lg">{release.version}</div>
                  <Badge variant={release.status === "RELEASED" ? "default" : release.status === "READY" ? "secondary" : "outline"}>
                    {release.status}
                  </Badge>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-muted-foreground">Tests:</span>
                    {release.tests === "PASS" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs text-muted-foreground">Security:</span>
                    {release.security === "PASS" ? <CheckCircle2 className="h-4 w-4 text-success" /> : release.security === "PENDING" ? <Clock className="h-4 w-4 text-warning" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                  {release.status === "READY" && (
                    <Button size="sm" className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                      <Play className="h-3 w-3" />
                      Deploy
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

