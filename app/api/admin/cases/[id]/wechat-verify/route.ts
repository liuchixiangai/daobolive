import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// PUT /api/admin/cases/[id]/wechat-verify — 标记微信已核验
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

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    const body = await request.json();
    const note = body.note?.trim() || null;

    await prisma.case.update({
      where: { id },
      data: {
        wechatVerified: true,
        wechatVerifiedAt: new Date(),
        wechatVerifiedById: admin.id,
        wechatVerifiedNote: note,
      },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "WECHAT_VERIFY",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `微信核验: ${existing.name}${note ? " - " + note : ""}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wechat verify error:", error);
    return NextResponse.json({ error: "核验失败" }, { status: 500 });
  }
}

// DELETE /api/admin/cases/[id]/wechat-verify — 取消微信核验
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    if (!existing.wechatVerified) {
      return NextResponse.json({ error: "尚未核验" }, { status: 400 });
    }

    await prisma.case.update({
      where: { id },
      data: {
        wechatVerified: false,
        wechatVerifiedAt: null,
        wechatVerifiedById: null,
        wechatVerifiedNote: null,
      },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "WECHAT_UNVERIFY",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `取消微信核验: ${existing.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wechat unverify error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
