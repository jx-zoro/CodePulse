"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, Info, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/lib/store/useHistoryStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SecurityFinding {
  id: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  title: string;
  description: string;
  affectedEndpoint?: string;
  evidence?: string;
  recommendation?: string;
  timestamp: string;
}

export default function SecurityPage() {
  const { tests } = useHistoryStore();
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Generate findings dynamically from history
    const generatedFindings: SecurityFinding[] = [];
    
    tests.forEach((test: any) => {
      try {
        const url = new URL(test.request.url);
        
        // 1. Missing Auth
        const hasAuth = test.request.headers?.some((h: any) => h.name.toLowerCase() === "authorization") || 
                        test.request.headers?.some((h: any) => h.name.toLowerCase() === "cookie");
        if (!hasAuth) {
          generatedFindings.push({
            id: `auth-${test.id}`,
            category: "Authentication",
            severity: "LOW",
            title: "Missing Authentication Metadata",
            description: "Request executed without standard Authorization headers or cookies.",
            affectedEndpoint: `${test.request.method} ${url.pathname}`,
            recommendation: "Ensure this endpoint is intended to be public, or add Authorization.",
            timestamp: test.timestamp
          });
        }

        // 2. Sensitive Data in URL
        if (url.search.toLowerCase().includes("password") || url.search.toLowerCase().includes("token") || url.search.toLowerCase().includes("secret") || url.search.toLowerCase().includes("key")) {
          generatedFindings.push({
            id: `leak-${test.id}`,
            category: "Data Exposure",
            severity: "CRITICAL",
            title: "Sensitive Data in URL",
            description: "Credentials or tokens detected in the URL query string.",
            evidence: url.search,
            affectedEndpoint: `${test.request.method} ${url.pathname}`,
            recommendation: "Move sensitive data to the request body or standard headers.",
            timestamp: test.timestamp
          });
        }

        // 3. Response headers (if any)
        if (test.response && test.response.headers) {
          const headers = test.response.headers as Record<string, string>;
          const hasXSS = Object.keys(headers).some(k => k.toLowerCase() === 'x-xss-protection');
          const hasFrame = Object.keys(headers).some(k => k.toLowerCase() === 'x-frame-options');
          
          if (!hasXSS || !hasFrame) {
            generatedFindings.push({
              id: `header-${test.id}`,
              category: "Security Headers",
              severity: "INFO",
              title: "Missing Security Headers",
              description: "Response lacks standard security headers (X-XSS-Protection, X-Frame-Options).",
              affectedEndpoint: `${test.request.method} ${url.pathname}`,
              recommendation: "Configure your API gateway or web server to append strict security headers.",
              timestamp: test.timestamp
            });
          }
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    });

    // Deduplicate by affectedEndpoint + title
    const unique = generatedFindings.reduce((acc, current) => {
      const x = acc.find(item => item.affectedEndpoint === current.affectedEndpoint && item.title === current.title);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as SecurityFinding[]);

    setFindings(unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setLoading(false);
  }, [tests]);

  const criticalCount = findings.filter(f => f.severity === "CRITICAL" || f.severity === "HIGH").length;
  const warningCount = findings.filter(f => f.severity === "MEDIUM" || f.severity === "LOW").length;
  const infoCount = findings.filter(f => f.severity === "INFO").length;
  
  const score = findings.length === 0 ? "A+" : criticalCount > 0 ? "F" : warningCount > 2 ? "C" : "B";
  const scoreColor = score === "A+" ? "text-success" : score === "F" ? "text-destructive" : score === "C" ? "text-warning" : "text-primary";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Security Posture</h1>
          <p className="text-muted-foreground">Analyze and monitor your API security configuration based on historical executions.</p>
        </div>
        <Button onClick={() => router.push("/test")} className="gap-2">
          <Lock className="h-4 w-4" />
          Test New Endpoint
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <ShieldCheck className={cn("h-4 w-4", scoreColor)} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", scoreColor)}>{score}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on {tests.length} executions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High / Critical</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medium / Low</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{warningCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Review when possible</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{infoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Best practices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Findings</CardTitle>
          <CardDescription>Vulnerabilities and warnings detected during execution.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Analyzing historical requests...</div>
          ) : findings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
              <ShieldCheck className="h-8 w-8 mx-auto mb-3 text-success opacity-50" />
              <p className="font-medium text-foreground">No security findings</p>
              <p className="text-sm mt-1">Your recent API executions match security best practices.</p>
            </div>
          ) : (
            <div className="divide-y">
              {findings.map((finding) => (
                <div key={finding.id} className="py-4 flex gap-4">
                  <div className="mt-1">{getSeverityIcon(finding.severity)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{finding.title}</h4>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {finding.affectedEndpoint}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{finding.description}</p>
                    
                    {finding.evidence && (
                      <div className="bg-destructive/5 border border-destructive/20 text-destructive text-xs font-mono p-2 rounded break-all">
                        <strong>Evidence:</strong> {finding.evidence}
                      </div>
                    )}
                    
                    {finding.recommendation && (
                      <div className="bg-muted/50 p-3 rounded-md text-sm border">
                        <strong className="text-xs uppercase text-muted-foreground block mb-1">Recommendation</strong>
                        {finding.recommendation}
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
