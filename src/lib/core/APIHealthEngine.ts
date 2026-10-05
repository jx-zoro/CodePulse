export interface HealthBreakdown {
  score: number;
  maxScore: number;
  status: "Healthy" | "Warning" | "Critical" | "Insufficient Data";
  reasons: string[];
}

export interface ApiHealthReport {
  overallScore: number;
  availability: HealthBreakdown;
  performance: HealthBreakdown;
  reliability: HealthBreakdown;
  contracts: HealthBreakdown;
  security: HealthBreakdown;
  hasInsufficientData: boolean;
}

export class APIHealthEngine {
  
  static calculateHealth(historyTests: any[], baselines: any[], testCases: any[]): ApiHealthReport {
    // If no history, everything is insufficient data
    if (!historyTests || historyTests.length === 0) {
      return {
        overallScore: 0,
        hasInsufficientData: true,
        availability: { score: 0, maxScore: 20, status: "Insufficient Data", reasons: ["No execution history found."] },
        performance: { score: 0, maxScore: 20, status: "Insufficient Data", reasons: ["No execution history found."] },
        reliability: { score: 0, maxScore: 20, status: "Insufficient Data", reasons: ["No execution history found."] },
        contracts: { score: 0, maxScore: 20, status: "Insufficient Data", reasons: ["No execution history found."] },
        security: { score: 0, maxScore: 20, status: "Insufficient Data", reasons: ["No execution history found."] }
      };
    }

    const totalRequests = historyTests.length;
    
    // 1. Availability (20 pts)
    // Focused purely on Network/5xx availability.
    let availabilityScore = 20;
    const availabilityReasons: string[] = [];
    
    const unavailableCount = historyTests.filter(t => !t.response || (t.response.status >= 500 && t.response.status < 600)).length;
    const availabilityRate = ((totalRequests - unavailableCount) / totalRequests) * 100;
    
    if (availabilityRate >= 99) {
      availabilityReasons.push(`Excellent uptime: ${availabilityRate.toFixed(1)}% availability.`);
    } else if (availabilityRate >= 95) {
      availabilityScore = 15;
      availabilityReasons.push(`Degraded uptime: ${availabilityRate.toFixed(1)}% availability (${unavailableCount} 5xx/network errors).`);
    } else {
      availabilityScore = Math.max(0, Math.floor((availabilityRate / 100) * 20));
      availabilityReasons.push(`Critical uptime issues: ${availabilityRate.toFixed(1)}% availability (${unavailableCount} outages).`);
    }

    // 2. Performance (20 pts)
    let performanceScore = 20;
    const performanceReasons: string[] = [];
    
    const latencies = historyTests.map(t => t.response?.metrics?.totalTime || 0).filter(l => l > 0);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    
    // Calculate P95
    let p95 = 0;
    if (latencies.length > 0) {
      latencies.sort((a, b) => a - b);
      const idx = Math.floor(latencies.length * 0.95);
      p95 = latencies[idx];
    }
    
    if (p95 === 0) {
      performanceScore = 20;
      performanceReasons.push("No latency data recorded yet.");
    } else if (p95 <= 500) {
      performanceReasons.push(`Excellent performance. P95 latency is ${Math.round(p95)}ms (Target: <500ms).`);
    } else if (p95 <= 1500) {
      performanceScore = 12;
      performanceReasons.push(`Warning: P95 latency is ${Math.round(p95)}ms, indicating slow responses (Target: <500ms).`);
    } else {
      performanceScore = 5;
      performanceReasons.push(`Critical: P95 latency is ${Math.round(p95)}ms, severely violating performance targets.`);
    }
    
    // 3. Reliability (20 pts)
    // Focused on 4xx business logic errors and explicit assertions/test cases.
    let reliabilityScore = 20;
    const reliabilityReasons: string[] = [];
    
    const businessErrors = historyTests.filter(t => t.response && t.response.status >= 400 && t.response.status < 500).length;
    const reliabilityRate = ((totalRequests - businessErrors) / totalRequests) * 100;
    
    if (businessErrors === 0) {
      reliabilityReasons.push("0 business logic errors (4xx) detected.");
    } else if (reliabilityRate > 90) {
      reliabilityScore = 15;
      reliabilityReasons.push(`${businessErrors} client errors (4xx) detected, slightly impacting reliability.`);
    } else {
      reliabilityScore = Math.max(0, Math.floor((reliabilityRate / 100) * 20));
      reliabilityReasons.push(`High rate of client errors (4xx): ${businessErrors} requests failed.`);
    }

    if (testCases && testCases.length > 0) {
      reliabilityReasons.push(`${testCases.length} test cases configured for validation.`);
    } else {
      reliabilityScore -= 5;
      reliabilityReasons.push("No test assertions configured. Missing automated validation.");
    }

    // 4. Contracts (20 pts)
    let contractScore = 20;
    const contractReasons: string[] = [];
    
    // Simplistic check for schema/type validation via assertions history (if we had them detailed).
    // For now, we will flag endpoints returning 404 (missing contract implementation) or 415/406.
    const contractViolations = historyTests.filter(t => t.response && [404, 405, 406, 415, 422].includes(t.response.status)).length;
    
    if (contractViolations === 0) {
      contractReasons.push("No obvious contract violations (404, 405, 422) detected.");
    } else {
      contractScore -= Math.min(20, contractViolations * 5);
      contractReasons.push(`${contractViolations} potential contract violations (e.g. 404 Not Found, 422 Unprocessable).`);
    }

    // 5. Security (20 pts)
    let securityScore = 20;
    const securityReasons: string[] = [];
    
    let authMissing = 0;
    let urlLeaks = 0;
    let authFailures = 0; // 401, 403

    historyTests.forEach(t => {
      try {
        const url = new URL(t.request.url);
        if (url.search.toLowerCase().includes("password") || url.search.toLowerCase().includes("token") || url.search.toLowerCase().includes("secret") || url.search.toLowerCase().includes("key")) {
          urlLeaks++;
        }
        
        const hasAuth = t.request.headers?.some((h: any) => h.name.toLowerCase() === "authorization") || 
                        t.request.headers?.some((h: any) => h.name.toLowerCase() === "cookie");
        if (!hasAuth) authMissing++;
        
        if (t.response && (t.response.status === 401 || t.response.status === 403)) authFailures++;
      } catch (e) {}
    });

    if (urlLeaks > 0) {
      securityScore -= 10;
      securityReasons.push(`Critical: ${urlLeaks} instances of sensitive data (secrets/tokens) exposed in URLs.`);
    }
    
    if (authFailures > 0) {
      securityScore -= 5;
      securityReasons.push(`${authFailures} requests failed due to Authentication/Authorization (401/403).`);
    } else {
      securityReasons.push("0 authorization failures.");
    }

    if (authMissing > 0 && securityScore === 20) {
      securityScore -= 2;
      securityReasons.push(`${authMissing} requests executed without auth headers (may be intentional for public APIs).`);
    } else if (securityScore === 20) {
      securityReasons.push("No security red flags detected in execution history.");
    }

    // Wrap it up
    const overallScore = availabilityScore + performanceScore + reliabilityScore + contractScore + securityScore;

    const getStatus = (score: number, max: number) => {
      const pct = score / max;
      if (pct >= 0.8) return "Healthy";
      if (pct >= 0.5) return "Warning";
      return "Critical";
    };

    return {
      overallScore,
      hasInsufficientData: totalRequests < 3,
      availability: { score: availabilityScore, maxScore: 20, status: getStatus(availabilityScore, 20), reasons: availabilityReasons },
      performance: { score: performanceScore, maxScore: 20, status: getStatus(performanceScore, 20), reasons: performanceReasons },
      reliability: { score: reliabilityScore, maxScore: 20, status: getStatus(reliabilityScore, 20), reasons: reliabilityReasons },
      contracts: { score: contractScore, maxScore: 20, status: getStatus(contractScore, 20), reasons: contractReasons },
      security: { score: Math.max(0, securityScore), maxScore: 20, status: getStatus(securityScore, 20), reasons: securityReasons }
    };
  }
}
