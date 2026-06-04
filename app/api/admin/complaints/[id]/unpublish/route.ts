import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// POST /api/admin/complaints/[id]/unpublish — 一键下架被投诉案例
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { case: { select: { id: true, caseNo: true, name: true, status: true } } },
    });

    if (!complaint) {
      return NextResponse.json({ error: "投诉不存在" }, { status: 404 });
    }

    if (!complaint.case) {
      return NextResponse.json({ error: "关联案例不存在" }, { status: 404 });
    }

    if (complaint.case.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: `案例当前状态为 ${complaint.case.status}，无法下架` },
        { status: 400 }
      );
    }

    // 下架案例
    await prisma.case.update({
      where: { id: complaint.case.id },
      data: { status: "UNPUBLISHED" },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "COMPLAINT_UNPUBLISH",
      caseNo: complaint.case.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `因投诉 ${complaint.id} 一键下架案例: ${complaint.case.name}`,
    });

    // 更新投诉处理状态
    await prisma.complaint.update({
      where: { id },
      data: {
        handlerId: admin.id,
        handlerNote: (complaint.handlerNote || "") + `\n[${new Date().toLocaleString("zh-CN")}] 已下架案例`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "案例已下架",
    });
  } catch (error) {
    console.error("Unpublish via complaint error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
