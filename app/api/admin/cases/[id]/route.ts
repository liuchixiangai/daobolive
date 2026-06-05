import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";
import { isSuperAdmin } from "@/lib/auth";

// GET /api/admin/cases/[id] — 案例详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, username: true } },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    return NextResponse.json({ case: caseItem });
  } catch (error) {
    console.error("Get case error:", error);
    return NextResponse.json({ error: "获取案例失败" }, { status: 500 });
  }
}

// PUT /api/admin/cases/[id] — 编辑案例
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

    // 验证必填字段
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "案例名称不能为空" }, { status: 400 });
    }
    if (!body.directorName?.trim()) {
      return NextResponse.json({ error: "导播姓名不能为空" }, { status: 400 });
    }
    if (!body.category?.trim()) {
      return NextResponse.json({ error: "活动分类不能为空" }, { status: 400 });
    }

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    const updated = await prisma.case.update({
      where: { id },
      data: {
        name: body.name.trim(),
        directorName: body.directorName.trim(),
        teamName: body.teamName?.trim() || null,
        contactInfo: body.contactInfo?.trim() || null,
        category: body.category.trim(),
        province: body.province?.trim() || null,
        city: body.city?.trim() || null,
        contactPerson: body.contactPerson?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        contactWechat: body.contactWechat?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        summary: body.summary?.trim() || null,
        teamDisplay: body.teamDisplay?.trim() || null,
        techTags: body.techTags?.trim() || null,
      },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "EDIT_CASE",
      caseNo: updated.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `编辑导播案例: ${updated.name}`,
    });

    return NextResponse.json({ case: updated });
  } catch (error) {
    console.error("Update case error:", error);
    return NextResponse.json({ error: "更新案例失败" }, { status: 500 });
  }
}

// DELETE /api/admin/cases/[id] — 删除案例
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

    // RBAC: 只有创建者或 SUPER_ADMIN 可以删除
    if (existing.creatorId !== admin.id && !isSuperAdmin(admin.role)) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 });
    }

    await prisma.case.delete({ where: { id } });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "DELETE_CASE",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `删除导播案例: ${existing.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete case error:", error);
    return NextResponse.json({ error: "删除案例失败" }, { status: 500 });
  }
}
