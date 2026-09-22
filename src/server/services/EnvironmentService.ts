import { prisma } from "../db";

export class EnvironmentService {
  
  static async createEnvironment(workspaceId: string, name: string, type: string = "development") {
    return prisma.environment.create({
      data: {
        workspaceId,
        name,
        type,
      },
    });
  }

  static async getEnvironments(workspaceId: string) {
    return prisma.environment.findMany({
      where: { workspaceId },
      include: { variables: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async addVariable(environmentId: string, key: string, value: string, type: string = "default") {
    return prisma.environmentVariable.create({
      data: {
        environmentId,
        key,
        value,
        type,
      },
    });
  }
}
