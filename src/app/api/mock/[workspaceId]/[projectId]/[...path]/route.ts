import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(req: Request, { params }: { params: Promise<{ workspaceId: string, projectId: string, path: string[] }> }) {
  return handleMockRequest("GET", req, await params);
}

export async function POST(req: Request, { params }: { params: Promise<{ workspaceId: string, projectId: string, path: string[] }> }) {
  return handleMockRequest("POST", req, await params);
}

export async function PUT(req: Request, { params }: { params: Promise<{ workspaceId: string, projectId: string, path: string[] }> }) {
  return handleMockRequest("PUT", req, await params);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ workspaceId: string, projectId: string, path: string[] }> }) {
  return handleMockRequest("DELETE", req, await params);
}

async function handleMockRequest(method: string, req: Request, params: { workspaceId: string, projectId: string, path: string[] }) {
  const urlPath = `/${params.path.join("/")}`;

  try {
    const mockConfig = await prisma.mockConfig.findUnique({
      where: {
        projectId_method_path: {
          projectId: params.projectId,
          method: method,
          path: urlPath
        }
      }
    });

    if (!mockConfig || !mockConfig.enabled) {
      return NextResponse.json({ 
        message: "Mock endpoint not found or disabled.",
        details: { method, path: urlPath, projectId: params.projectId }
      }, { status: 404 });
    }

    if (mockConfig.latencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, mockConfig.latencyMs));
    }

    const headersList: Record<string, string> = {};
    try {
      const parsedHeaders = JSON.parse(mockConfig.headers);
      if (Array.isArray(parsedHeaders)) {
        parsedHeaders.forEach(h => { if (h.key && h.value) headersList[h.key] = h.value; });
      }
    } catch (e) {
      // Ignore header parsing errors
    }

    let bodyData = mockConfig.responseBody;
    try {
      bodyData = JSON.parse(mockConfig.responseBody);
    } catch (e) {}

    return NextResponse.json(bodyData, {
      status: mockConfig.statusCode,
      headers: headersList
    });

  } catch (error) {
    console.error("Mock Server Error:", error);
    return NextResponse.json({ message: "Internal server error in Mock Server" }, { status: 500 });
  }
}
