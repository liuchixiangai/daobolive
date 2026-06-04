import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// PUT /api/admin/cases/[id]/status — 发布/下架/恢复发布/拒绝
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
    const newStatus = body.status;

    const VALID_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "REJECTED"];
    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: "无效的状态" }, { status: 400 });
    }

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    // 发布前风控检查
    if (newStatus === "PUBLISHED") {
      const checks: string[] = [];
      if (!existing.name?.trim()) {
        checks.push("未填写案例名称，不能发布");
      }
      if (!existing.htmlContent?.trim()) {
        checks.push("未保存 HTML，不能发布");
      }
      if (!existing.commitmentUploaded) {
        checks.push("未上传承诺书，不能发布");
      }
      if (!existing.wechatVerified) {
        checks.push("未完成微信核验，不能发布");
      }

      if (checks.length > 0) {
        return NextResponse.json(
          { error: checks[0], allErrors: checks },
          { status: 400 }
        );
      }
    }

    // DRAFT <-> PUBLISHED <-> UNPUBLISHED <-> DRAFT
    // 只允许合法状态转换
    const validTransitions: Record<string, string[]> = {
      DRAFT: ["PUBLISHED", "REJECTED"],
      PUBLISHED: ["UNPUBLISHED"],
      UNPUBLISHED: ["PUBLISHED"],   // 恢复发布
      REJECTED: ["DRAFT"],           // 恢复为草稿
    };

    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        { error: `当前案例状态不允许${newStatus === "PUBLISHED" ? "发布" : "此操作"}` },
        { status: 400 }
      );
    }

    const updated = await prisma.case.update({
      where: { id },
      data: { status: newStatus },
    });

    // 写入操作日志
    const actionMap: Record<string, string> = {
      PUBLISHED: "PUBLISH_CASE",
      UNPUBLISHED: "UNPUBLISH_CASE",
      DRAFT: "RESTORE_CASE",
      REJECTED: "REJECT_CASE",
    };

    const noteMap: Record<string, string> = {
      PUBLISHED: `发布导播案例: ${existing.name}`,
      UNPUBLISHED: `下架导播案例: ${existing.name}`,
      DRAFT: `恢复发布导播案例: ${existing.name}`,
      REJECTED: `拒绝导播案例: ${existing.name}`,
    };

    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: actionMap[newStatus] || "CHANGE_STATUS",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: noteMap[newStatus] || `状态变更为: ${newStatus}`,
    });

    return NextResponse.json({ case: updated });
  } catch (error) {
    console.error("Status change error:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
