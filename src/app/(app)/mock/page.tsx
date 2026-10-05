"use client";

import { useState } from "react";
import { Server, Plus, Play, Pause, Trash2, Edit2, Clock, Activity, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MockServersPage() {
  const [mocks] = useState<any[]>([]); // In reality this would come from a store or API

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Mock Servers</h1>
          <p className="text-muted-foreground">Configure realistic mock endpoints and fault injection.</p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Create Mock (Coming Soon)
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Mocks</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mocks.length}</div>
            <p className="text-xs text-muted-foreground">Endpoints serving traffic</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fault Injection</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Simulating 500/timeouts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Endpoints</CardTitle>
          <CardDescription>Mock endpoints allow frontend teams to develop without backend dependencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
            <HardDrive className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <h3 className="font-medium text-foreground mb-1">No Mock Servers Configured</h3>
            <p className="text-sm max-w-sm mx-auto">You can create mock servers to return static JSON responses or simulate network failures during testing.</p>
            <Button variant="outline" className="mt-4" disabled>Configure First Mock</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
