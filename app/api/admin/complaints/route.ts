import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/complaints — 投诉列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          handler: { select: { id: true, username: true } },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      complaints,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List complaints error:", error);
    return NextResponse.json({ error: "获取投诉列表失败" }, { status: 500 });
  }
}
