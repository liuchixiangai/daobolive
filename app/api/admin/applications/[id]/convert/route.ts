import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";

// POST /api/admin/applications/[id]/convert — 一键转为导播案例草稿
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: "申请不存在" }, { status: 404 });

    if (app.status === "CONVERTED") {
      return NextResponse.json({ error: "该申请已转为案例" }, { status: 400 });
    }

    // 生成导播案例编号
    const lastCase = await prisma.case.findFirst({
      orderBy: { createdAt: "desc" },
      select: { caseNo: true },
    });
    let caseNo = "000001";
    if (lastCase?.caseNo) {
      const n = parseInt(lastCase.caseNo, 10);
      if (!isNaN(n)) caseNo = String(n + 1).padStart(6, "0");
    }

    // 创建案例草稿，自动带入申请信息
    const newCase = await prisma.case.create({
      data: {
        caseNo,
        status: "DRAFT",
        name: app.teamName, // 先以团队名作为案例名
        directorName: "", // 待管理员补充
        teamName: app.teamName,
        contactPerson: app.contactName,
        contactPhone: app.contactPhone,
        contactEmail: app.contactEmail,
        creatorId: admin.id,
        sourceApplicationNo: app.appNo,
        // 电子承诺书记录
        commitmentUploaded: true,
        commitmentFileName: `电子承诺书 ${app.commitmentVersion}`,
        commitmentUploadedAt: app.commitmentAgreedAt,
        commitmentUploadedBy: app.contactName,
      },
    });

    // 更新申请状态
    await prisma.application.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    // 操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "CONVERT_APPLICATION",
      caseNo,
      result: "SUCCESS",
      note: `申请 ${app.appNo} 转为导播案例 ${caseNo}`,
    });

    return NextResponse.json({
      success: true,
      caseId: newCase.id,
      caseNo: newCase.caseNo,
    });
  } catch (error) {
    console.error("Convert application error:", error);
    return NextResponse.json({ error: "转换失败" }, { status: 500 });
  }
}
