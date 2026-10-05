import { RegressionAlert } from "../store/useRegressionStore";

export class APIRegressionEngine {
  
  static analyze(tests: any[], baselines: any[]): RegressionAlert[] {
    const alerts: RegressionAlert[] = [];
    if (!tests || tests.length < 5) return alerts;

    // Group tests by method + url base
    const endpoints = new Map<string, any[]>();
    tests.forEach(t => {
      try {
        const url = new URL(t.request.url);
        const key = `${t.request.method} ${url.pathname}`;
        if (!endpoints.has(key)) endpoints.set(key, []);
        endpoints.get(key)!.push(t);
      } catch(e) {}
    });

    endpoints.forEach((endpointTests, key) => {
      if (endpointTests.length < 5) return; // Need at least 5 samples

      // Sort chronological (oldest to newest)
      const sorted = endpointTests.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Split into "historical" (baseline) vs "recent" (last 3)
      const recent = sorted.slice(-3);
      const historical = sorted.slice(0, sorted.length - 3);

      if (historical.length < 2) return;

      const [method, pathname] = key.split(" ");

      // Calculate historical metrics
      const histLatencies = historical.map(t => t.response?.metrics?.totalTime || 0).filter(l => l > 0).sort((a, b) => a - b);
      const histSuccess = historical.filter(t => t.response && t.response.status >= 200 && t.response.status < 300).length;
      const histSuccessRate = (histSuccess / historical.length) * 100;
      const histP95 = histLatencies.length > 0 ? histLatencies[Math.floor(histLatencies.length * 0.95) || 0] : 0;
      
      // Calculate recent metrics
      const recLatencies = recent.map(t => t.response?.metrics?.totalTime || 0).filter(l => l > 0).sort((a, b) => a - b);
      const recSuccess = recent.filter(t => t.response && t.response.status >= 200 && t.response.status < 300).length;
      const recSuccessRate = (recSuccess / recent.length) * 100;
      const recP95 = recLatencies.length > 0 ? recLatencies[Math.floor(recLatencies.length * 0.95) || 0] : 0;

      const metrics = [];
      let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
      let isRegression = false;

      // Detect Latency Regression (> 50% increase AND > 200ms diff)
      if (histP95 > 0 && recP95 > histP95) {
        const delta = recP95 - histP95;
        const pct = (delta / histP95) * 100;
        
        if (pct > 50 && delta > 200) {
          isRegression = true;
          metrics.push({
            name: "P95 Latency",
            before: `${Math.round(histP95)}ms`,
            after: `${Math.round(recP95)}ms`,
            deltaPercent: Math.round(pct)
          });
          if (pct > 100 || delta > 1000) severity = "CRITICAL";
          else if (pct > 50) severity = "HIGH";
        }
      }

      // Detect Success Rate Regression (> 10% drop)
      if (histSuccessRate > recSuccessRate) {
        const drop = histSuccessRate - recSuccessRate;
        if (drop > 10) {
          isRegression = true;
          metrics.push({
            name: "Success Rate",
            before: `${histSuccessRate.toFixed(1)}%`,
            after: `${recSuccessRate.toFixed(1)}%`,
            deltaPercent: -Math.round(drop)
          });
          if (drop > 30) severity = "CRITICAL";
          else if (severity !== "CRITICAL") severity = "HIGH";
        }
      }

      // Detect new 5xx errors
      const rec5xx = recent.filter(t => !t.response || (t.response.status >= 500 && t.response.status < 600)).length;
      const hist5xx = historical.filter(t => !t.response || (t.response.status >= 500 && t.response.status < 600)).length;
      
      if (rec5xx > 0 && hist5xx === 0) {
        isRegression = true;
        metrics.push({
          name: "5xx Errors",
          before: "0 occurrences",
          after: `${rec5xx} occurrences`,
        });
        severity = "CRITICAL";
      }

      // Generate alert
      if (isRegression) {
        alerts.push({
          id: `reg-${method}-${pathname}-${recent[recent.length-1].id}`,
          endpointUrl: pathname, // Storing pathname for display
          method,
          severity,
          status: "OPEN",
          detectedAt: new Date().toISOString(),
          metrics,
          recentExecutionId: recent[recent.length-1].id,
          baselineExecutionId: historical[historical.length-1].id
        });
      }
    });

    return alerts;
  }
}
