import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { SecurityAnalyzerService } from "@/server/services/SecurityAnalyzerService";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const findings = await SecurityAnalyzerService.getProjectFindings((await params).projectId);
    return NextResponse.json(findings);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching security findings" }, { status: 500 });
  }
}

