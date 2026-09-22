"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHistoryStore } from "@/lib/store/useHistoryStore";

export default function HistoryPage() {
  const { tests, removeTest, clearHistory } = useHistoryStore();

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">View and filter your previous API tests.</p>
        </div>
        {tests.length > 0 && (
          <Button variant="outline" className="text-destructive" onClick={clearHistory}>
            Clear History
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
          <CardDescription>A complete log of every request you&apos;ve made.</CardDescription>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              No history found. Run a test in the API Tester to see it here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Endpoint</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Size</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-semibold",
                          test.request.method === "GET" && "bg-info/10 text-info",
                          test.request.method === "POST" && "bg-success/10 text-success",
                          test.request.method === "PUT" && "bg-warning/10 text-warning",
                          test.request.method === "DELETE" && "bg-destructive/10 text-destructive",
                          test.request.method === "PATCH" && "bg-warning/10 text-warning",
                        )}>
                          {test.request.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs max-w-[300px] truncate" title={test.request.url}>
                        {test.request.url.replace(/^https?:\/\//, '')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "flex items-center gap-1.5 font-medium",
                          test.response?.status === 200 && "text-success",
                          test.response?.status === 201 && "text-success",
                          test.response?.status === 400 && "text-warning",
                          test.response?.status === 401 && "text-warning",
                          test.response?.status === 403 && "text-warning",
                          test.response?.status === 404 && "text-warning",
                          (test.response?.status ?? 500) >= 500 && "text-destructive"
                        )}>
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            test.response?.status === 200 && "bg-success",
                            test.response?.status === 201 && "bg-success",
                            test.response?.status === 400 && "bg-warning",
                            test.response?.status === 401 && "bg-warning",
                            test.response?.status === 403 && "bg-warning",
                            test.response?.status === 404 && "bg-warning",
                            (test.response?.status ?? 500) >= 500 && "bg-destructive"
                          )} />
                          {test.response?.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{test.response?.metrics.totalTime} ms</td>
                      <td className="px-4 py-3 text-muted-foreground">{(test.response?.size ? test.response.size / 1024 : 0).toFixed(1)} KB</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeTest(test.id)} className="text-muted-foreground hover:text-destructive">
                          Delete
                        </Button>
                      </td>
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
