import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/applications — 申请列表
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const status = sp.get("status");
    const search = sp.get("search")?.trim();
    const page = parseInt(sp.get("page") || "1");
    const pageSize = parseInt(sp.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { appNo: { contains: search } },
        { teamName: { contains: search } },
        { contactName: { contains: search } },
        { contactPhone: { contains: search } },
        { contactEmail: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List applications error:", error);
    return NextResponse.json({ error: "获取申请列表失败" }, { status: 500 });
  }
}
