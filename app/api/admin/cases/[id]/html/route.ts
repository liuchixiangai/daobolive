import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";
import { sanitizeHtml } from "@/lib/html-sanitizer";

// PUT /api/admin/cases/[id]/html — 保存 HTML
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
    const rawHtml = body.htmlContent;

    if (rawHtml === undefined || rawHtml === null) {
      return NextResponse.json({ error: "HTML 内容不能为空" }, { status: 400 });
    }

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    // 安全清洗
    const result = sanitizeHtml(String(rawHtml));

    await prisma.case.update({
      where: { id },
      data: { htmlContent: result.html },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "SAVE_HTML",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `保存 HTML: ${existing.name}`,
    });

    return NextResponse.json({
      success: true,
      sanitized: result.html,
      warnings: result.iframeBlocked
        ? ["部分 iframe 域名不在白名单中，已被提示替换"]
        : [],
    });
  } catch (error) {
    console.error("Save HTML error:", error);
    return NextResponse.json({ error: "保存 HTML 失败" }, { status: 500 });
  }
}
