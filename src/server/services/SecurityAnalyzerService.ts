import { prisma } from "../db";

export interface SecurityFindingRequest {
  projectId: string;
  category: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  evidence?: string;
  affectedEndpoint?: string;
  recommendation?: string;
}

export class SecurityAnalyzerService {
  
  static async analyzeRequestResponse(projectId: string, request: any, response: any): Promise<SecurityFindingRequest[]> {
    const findings: SecurityFindingRequest[] = [];
    const url = new URL(request.url);

    // 1. Check for missing authentication (if this isn't a public API)
    const hasAuthHeader = Object.keys(request.headers || {}).some(k => k.toLowerCase() === "authorization");
    const hasCookie = Object.keys(request.headers || {}).some(k => k.toLowerCase() === "cookie");
    if (!hasAuthHeader && !hasCookie) {
      findings.push({
        projectId,
        category: "Authentication",
        severity: "LOW",
        title: "Missing Authentication Metadata",
        description: "The request does not contain standard Authentication headers or cookies.",
        affectedEndpoint: `${request.method} ${url.pathname}`,
        recommendation: "Ensure this endpoint is intended to be public, or add Authentication requirements."
      });
    }

    // 2. Check for sensitive data exposure in URL
    if (url.search.includes("password") || url.search.includes("token") || url.search.includes("secret")) {
      findings.push({
        projectId,
        category: "Data Exposure",
        severity: "HIGH",
        title: "Sensitive Data in URL",
        description: "Credentials or tokens were detected in the URL query string.",
        affectedEndpoint: `${request.method} ${url.pathname}`,
        evidence: url.search,
        recommendation: "Move sensitive data to the request body or standard Authorization headers."
      });
    }

    // 3. Check for X-Powered-By
    const xPoweredBy = Object.keys(response.headers || {}).find(k => k.toLowerCase() === "x-powered-by");
    if (xPoweredBy) {
      findings.push({
        projectId,
        category: "Security Misconfiguration",
        severity: "LOW",
        title: "Framework Information Leakage",
        description: "The server is leaking the framework it runs on via the X-Powered-By header.",
        affectedEndpoint: `${request.method} ${url.pathname}`,
        evidence: `X-Powered-By: ${response.headers[xPoweredBy]}`,
        recommendation: "Disable the X-Powered-By header in your backend configuration."
      });
    }

    // 4. Insecure HTTP
    if (url.protocol === "http:") {
      findings.push({
        projectId,
        category: "Transport Security",
        severity: "MEDIUM",
        title: "Unencrypted Transport (HTTP)",
        description: "The API is being accessed over unencrypted HTTP instead of HTTPS.",
        affectedEndpoint: `${request.method} ${url.pathname}`,
        recommendation: "Always enforce HTTPS in production."
      });
    }

    return findings;
  }

  static async reportFinding(finding: SecurityFindingRequest) {
    return prisma.securityFinding.create({
      data: {
        ...finding,
        status: "OPEN"
      }
    });
  }

  static async getProjectFindings(projectId: string) {
    return prisma.securityFinding.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
