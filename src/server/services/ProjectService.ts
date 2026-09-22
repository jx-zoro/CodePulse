import { prisma } from "../db";

export class ProjectService {
  
  static async createProject(workspaceId: string, name: string, description?: string) {
    return prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
      },
    });
  }

  static async getProjects(workspaceId: string) {
    return prisma.project.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getProjectDetails(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        collections: {
          include: {
            requests: true
          }
        }
      }
    });
  }
}
