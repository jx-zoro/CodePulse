import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { WorkspaceService } from "@/server/services/WorkspaceService";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaces = await WorkspaceService.getWorkspacesForUser((session.user as any).id);
    return NextResponse.json(workspaces);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching workspaces" }, { status: 500 });
  }
}
