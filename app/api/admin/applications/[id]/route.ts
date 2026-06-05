import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// GET /api/admin/applications/[id] — 申请详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);

    const application = await prisma.application.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: "申请不存在" }, { status: 404 });
    }

    if (admin.id) {
      await createAuditLog({
        adminId: admin.id,
        adminName: admin.username,
        action: "VIEW_APPLICATION",
        note: `查看申请: ${application.appNo}`,
      });
    }

    // 也查一下关联的案例
    const linkedCase = application.appNo
      ? await prisma.case.findFirst({
          where: { sourceApplicationNo: application.appNo },
          select: { id: true, caseNo: true, name: true, status: true },
        })
      : null;

    return NextResponse.json({ application, linkedCase });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
