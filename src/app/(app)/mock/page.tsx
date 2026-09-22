"use client";

import { useState } from "react";
import { Server, Plus, Play, Pause, Trash2, Edit2, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MockServersPage() {
  const [mocks] = useState<any[]>([]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Mock Servers</h1>
          <p className="text-muted-foreground">Configure realistic mock endpoints and fault injection</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Mock
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Mocks</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Endpoints serving traffic</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fault Injection</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">1</div>
            <p className="text-xs text-muted-foreground">Simulating 500/timeouts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Endpoints</CardTitle>
          <CardDescription>Base URL: /api/mock/workspace_id/project_id</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mocks.map((mock) => (
              <div key={mock.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${!mock.enabled && 'opacity-60 bg-muted/50'}`}>
                <div className="flex items-center gap-4">
                  <Badge variant={mock.method === "GET" ? "default" : "secondary"}>{mock.method}</Badge>
                  <div className="font-mono text-sm">{mock.path}</div>
                  <Badge variant="outline" className={mock.status >= 400 ? "text-destructive border-destructive/50" : "text-success border-success/50"}>
                    {mock.status}
                  </Badge>
                  {mock.latency > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {mock.latency}ms
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    {mock.enabled ? <Pause className="h-4 w-4 text-muted-foreground" /> : <Play className="h-4 w-4 text-success" />}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

