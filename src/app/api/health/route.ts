import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    // Check DB Connection
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const end = performance.now();

    return NextResponse.json({
      status: "HEALTHY",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "UP",
          latencyMs: Math.round(end - start)
        },
        workerQueue: {
          status: "NOT_CONFIGURED",
          message: "Local execution environment."
        }
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: "DEGRADED",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "DOWN",
          error: error instanceof Error ? error.message : "Unknown database error"
        }
      }
    }, { status: 503 });
  }
}
