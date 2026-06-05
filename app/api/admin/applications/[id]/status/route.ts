import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// PUT /api/admin/applications/[id]/status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const body = await request.json();
    const { status } = body;

    // CONVERTED 只能通过 convert 接口完成，不允许手动设置
    const valid = ["PENDING", "CONTACTED", "REJECTED"];
    if (status === "CONVERTED") {
      return NextResponse.json({ error: "请使用'转为导播案例'功能来完成转换。" }, { status: 400 });
    }
    if (!valid.includes(status)) {
      return NextResponse.json({ error: "无效状态" }, { status: 400 });
    }

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: "申请不存在" }, { status: 404 });

    await prisma.application.update({ where: { id }, data: { status } });

    const labels: Record<string, string> = {
      CONTACTED: "标记为已联系",
      REJECTED: "拒绝申请",
      CONVERTED: "转为案例",
    };

    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "UPDATE_APPLICATION_STATUS",
      note: `${labels[status]}: ${app.appNo}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
