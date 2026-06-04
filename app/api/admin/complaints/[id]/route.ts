import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// GET /api/admin/complaints/[id] — 投诉详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNo: true,
            name: true,
            status: true,
            directorName: true,
            teamName: true,
          },
        },
        handler: { select: { id: true, username: true } },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: "投诉不存在" }, { status: 404 });
    }

    // 记录查看日志（仅当有管理员时）
    if (admin.id) {
      await createAuditLog({
        adminId: admin.id,
        adminName: admin.username,
        action: "VIEW_COMPLAINT",
        caseNo: complaint.caseNo,
        result: "SUCCESS",
        note: `查看投诉: ${complaint.id}`,
      });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("Get complaint error:", error);
    return NextResponse.json({ error: "获取投诉详情失败" }, { status: 500 });
  }
}
