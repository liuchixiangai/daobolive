import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/audit-logs
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const search = sp.get("search")?.trim();
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "50");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { caseNo: { contains: search } },
        { adminName: { contains: search } },
        { action: { contains: search } },
        { note: { contains: search } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          adminName: true,
          action: true,
          caseNo: true,
          ip: true,
          result: true,
          note: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({ logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "获取日志失败" }, { status: 500 });
  }
}
