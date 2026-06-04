import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// PUT /api/admin/complaints/[id]/status — 更新投诉状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const { status, note } = body;

    const VALID_STATUSES = ["PENDING", "PROCESSING", "RESOLVED", "REJECTED"];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "投诉不存在" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      status,
      handlerId: admin.id,
    };

    if (status === "RESOLVED" || status === "REJECTED") {
      updateData.handledAt = new Date();
    }

    if (note && note.trim()) {
      updateData.handlerNote = note.trim() + (existing.handlerNote ? "\n" + existing.handlerNote : "");
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    const statusLabels: Record<string, string> = {
      PROCESSING: "标记为处理中",
      RESOLVED: "标记为已处理",
      REJECTED: "标记为无效投诉",
    };

    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "HANDLE_COMPLAINT",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `${statusLabels[status] || "更新状态"}: 投诉 ${existing.id}${note ? " - " + note : ""}`,
    });

    return NextResponse.json({ complaint: updated });
  } catch (error) {
    console.error("Update complaint status error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
