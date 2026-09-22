import { ApiRequest, ApiResponse, PerformanceMetrics, Insight } from "./types";

export async function executeRequest(request: ApiRequest, timeoutMs: number = 30000): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let finalUrl = request.url;
  
  try {
    // 1. Process Query Parameters
    const activeParams = request.params.filter(p => p.enabled && p.key);
    if (activeParams.length > 0) {
      const urlObj = new URL(finalUrl);
      activeParams.forEach(p => urlObj.searchParams.append(p.key, p.value));
      finalUrl = urlObj.toString();
    }
  } catch (e) {
    return createErrorResponse("Invalid URL provided.", 0);
  }

  // 2. Process Headers
  const requestHeaders: Record<string, string> = {};
  request.headers.filter(h => h.enabled && h.key).forEach(h => {
    requestHeaders[h.key] = h.value;
  });

  // 3. Process Authentication
  if (request.authType === "bearer" && request.authData.token) {
    requestHeaders["Authorization"] = `Bearer ${request.authData.token}`;
  } else if (request.authType === "basic" && request.authData.username) {
    const credentials = btoa(`${request.authData.username}:${request.authData.password || ""}`);
    requestHeaders["Authorization"] = `Basic ${credentials}`;
  } else if (request.authType === "apikey" && request.authData.key && request.authData.value) {
    if (request.authData.addTo === "header") {
      requestHeaders[request.authData.key] = request.authData.value;
    } else {
      const urlObj = new URL(finalUrl);
      urlObj.searchParams.append(request.authData.key, request.authData.value);
      finalUrl = urlObj.toString();
    }
  }

  // 4. Determine Body
  let requestBody: string | undefined = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && request.bodyType !== "none") {
    requestBody = request.body;
    if (request.bodyType === "json" && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/json";
    } else if (request.bodyType === "form-url-encoded" && !requestHeaders["Content-Type"]) {
      requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
    }
  }

  try {
    const startTime = performance.now();
    
    // Attempt to proxy to bypass CORS
    const proxyResponse = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: finalUrl,
        method: request.method,
        headers: requestHeaders,
        body: requestBody
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!proxyResponse.ok) {
       // If the proxy itself fails (e.g. 500 error from proxy route)
       const errorData = await proxyResponse.json().catch(() => ({}));
       return createErrorResponse(errorData.error || `Proxy failed with status ${proxyResponse.status}`, 0);
    }

    const data = await proxyResponse.json();
    
    // We cannot easily get granular DNS/TLS times from standard fetch or proxy fetch. 
    // We approximate or leave them empty if not provided by browser.
    const metrics: PerformanceMetrics = {
      totalTime: Math.round(data.time || (performance.now() - startTime)),
    };

    return {
      status: data.status,
      statusText: data.statusText,
      headers: data.headers,
      body: data.body,
      size: data.size,
      contentType: data.contentType,
      metrics,
      insights: [] // Will be populated by analyzer
    };

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createErrorResponse(`Request timed out after ${timeoutMs}ms`, 0);
      }
      return createErrorResponse(`Network error: ${error.message}`, 0);
    }
    return createErrorResponse(`Unknown error occurred`, 0);
  }
}

function createErrorResponse(message: string, time: number): ApiResponse {
  return {
    status: 0,
    statusText: "Error",
    headers: {},
    body: "",
    size: 0,
    contentType: "",
    metrics: { totalTime: time },
    insights: [],
    error: message
  };
}
