"use client";

import { useState } from "react";
import { GitPullRequest, CheckCircle2, ShieldCheck, AlertTriangle, FileCode2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReleasesPage() {
  const [releases] = useState<any[]>([]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Versioning & Contracts</h1>
          <p className="text-muted-foreground">Manage OpenAPI contracts, breaking changes, and version history.</p>
        </div>
        <Button className="gap-2" disabled>
          <GitPullRequest className="h-4 w-4" />
          Create Release (Coming Soon)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Tests</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">Pass rate (Target &gt; 95%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Security</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">0 Critical Vulnerabilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Gate: Contracts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">No data</div>
            <p className="text-xs text-muted-foreground">OpenAPI Drift Detection</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Release History</CardTitle>
          <CardDescription>Track API changes, backward compatibility, and deployment milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
            <FileCode2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <h3 className="font-medium text-foreground mb-1">No API Releases</h3>
            <p className="text-sm max-w-sm mx-auto">Upload an OpenAPI specification to establish a baseline contract, then create a release to track changes over time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
