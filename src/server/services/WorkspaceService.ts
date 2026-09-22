import { prisma } from "../db";

export class WorkspaceService {
  
  static async createWorkspace(name: string, slug: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name, slug },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId,
          role: "OWNER",
        },
      });

      return workspace;
    });
  }

  static async getWorkspacesForUser(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    });
    return memberships.map(m => m.workspace);
  }

  static async getWorkspaceMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  }

  static async inviteMember(workspaceId: string, email: string, role: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found to invite");
    }

    return prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role,
      },
    });
  }

  static async hasPermission(userId: string, workspaceId: string, requiredRole: string[] = ["OWNER", "ADMIN", "EDITOR", "VIEWER"]) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId }
      }
    });

    if (!member) return false;
    return requiredRole.includes(member.role);
  }
}
