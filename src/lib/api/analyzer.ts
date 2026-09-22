import { ApiResponse, Insight } from "./types";

export function analyzeResponse(response: ApiResponse): { score: number, insights: Insight[] } {
  let score = 100;
  const insights: Insight[] = [];

  if (response.error) {
    return { score: 0, insights: [] };
  }

  // 1. Analyze Status Code
  if (response.status >= 400 && response.status < 500) {
    score -= 20;
    insights.push({
      id: "status-4xx",
      type: "warning",
      title: "Client Error (4xx)",
      description: `The server returned a ${response.status} status code.`,
      evidence: `Status: ${response.status} ${response.statusText}`,
      action: "Check the request URL, parameters, headers, and authentication."
    });
  } else if (response.status >= 500) {
    score -= 50;
    insights.push({
      id: "status-5xx",
      type: "error",
      title: "Server Error (5xx)",
      description: `The server returned a ${response.status} status code, indicating an internal failure.`,
      evidence: `Status: ${response.status} ${response.statusText}`,
      action: "Review server logs if possible. The API endpoint might be down or misconfigured."
    });
  }

  // 2. Analyze Response Time
  const time = response.metrics.totalTime;
  if (time > 1000) {
    score -= 30;
    insights.push({
      id: "slow-response",
      type: "error",
      title: "High Latency",
      description: "The API took over 1 second to respond.",
      evidence: `Response time: ${time}ms`,
      action: "Check backend database queries, external API dependencies, or server resources."
    });
  } else if (time > 500) {
    score -= 10;
    insights.push({
      id: "moderate-latency",
      type: "warning",
      title: "Elevated Latency",
      description: "The API response time is acceptable but could be improved.",
      evidence: `Response time: ${time}ms`,
    });
  } else {
    insights.push({
      id: "fast-response",
      type: "success",
      title: "Excellent Latency",
      description: "The API responded very quickly.",
      evidence: `Response time: ${time}ms`,
    });
  }

  // 3. Analyze Payload Size & Compression
  const isLarge = response.size > 50 * 1024; // > 50KB
  const encoding = (response.headers["content-encoding"] || response.headers["Content-Encoding"] || "").toLowerCase();
  const isCompressed = encoding.includes("gzip") || encoding.includes("br") || encoding.includes("deflate");
  const isText = (response.contentType || "").includes("json") || (response.contentType || "").includes("text");

  if (isLarge && isText && !isCompressed) {
    score -= 15;
    insights.push({
      id: "missing-compression",
      type: "warning",
      title: "Missing Compression",
      description: "The response is relatively large and text-based, but no compression (gzip/brotli) was detected.",
      evidence: `Size: ${(response.size / 1024).toFixed(1)} KB, Content-Encoding: ${encoding || "none"}`,
      action: "Enable gzip or brotli compression on your API server/proxy to reduce bandwidth."
    });
  }

  // Ensure score stays between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return { score, insights };
}
