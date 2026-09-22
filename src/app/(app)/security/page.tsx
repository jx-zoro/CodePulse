"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecurityFinding {
  id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  title: string;
  description: string;
  affectedEndpoint?: string;
  status: string;
  createdAt: string;
}

export default function SecurityPage() {
  // Hardcoded projectId for now; in reality, this would come from the context/URL
  const projectId = "default";
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to fetch from API; wait for projectId integration
    setLoading(false);
  }, [projectId]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <ShieldAlert className="text-destructive h-5 w-5" />;
      case "MEDIUM":
        return <AlertTriangle className="text-warning h-5 w-5" />;
      case "LOW":
        return <AlertCircle className="text-info h-5 w-5" />;
      default:
        return <Info className="text-muted-foreground h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Security Posture</h1>
          <p className="text-muted-foreground">Analyze and monitor your API security configuration</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          Run Security Scan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">A+</div>
            <p className="text-xs text-muted-foreground">0 Critical Findings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High / Critical</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">0</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medium / Low</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">0</div>
            <p className="text-xs text-muted-foreground">Review when possible</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">0</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Findings</CardTitle>
          <CardDescription>Security issues detected in your API requests, responses, and schemas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading findings...</div>
          ) : findings.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-success mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No Security Findings Detected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                Your APIs look secure based on our analysis. Run a security scan to re-evaluate endpoints.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {findings.map((f) => (
                <div key={f.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="mt-1">{getSeverityIcon(f.severity)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{f.title}</h4>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{f.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                    {f.affectedEndpoint && (
                      <div className="text-xs font-mono text-muted-foreground mt-2">
                        Endpoint: {f.affectedEndpoint}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
