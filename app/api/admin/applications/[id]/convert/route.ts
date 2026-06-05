import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";
import { nextCaseNo } from "@/lib/counter";

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

    // 条件更新：只有 PENDING 或 CONTACTED 才能转换，且 sourceApplicationNo 不重复
    const existingCase = await prisma.case.findFirst({
      where: { sourceApplicationNo: app.appNo },
    });
    if (existingCase) {
      // 已有案例，仅同步状态
      if (app.status !== "CONVERTED") {
        await prisma.application.update({ where: { id }, data: { status: "CONVERTED" } });
      }
      return NextResponse.json({
        success: true,
        caseId: existingCase.id,
        caseNo: existingCase.caseNo,
        alreadyConverted: true,
      });
    }

    // 原子更新申请状态为 CONVERTED（条件：status IN (PENDING, CONTACTED)）
    try {
      await prisma.application.updateMany({
        where: {
          id,
          status: { in: ["PENDING", "CONTACTED"] },
        },
        data: { status: "CONVERTED" },
      });
    } catch {
      return NextResponse.json({ error: "该申请已被转换或状态不允许" }, { status: 400 });
    }

    // 重新获取以确认状态已更新
    const updatedApp = await prisma.application.findUnique({ where: { id } });
    if (!updatedApp || updatedApp.status !== "CONVERTED") {
      return NextResponse.json({ error: "该申请已被转换或状态不允许" }, { status: 400 });
    }

    // 原子生成导播案例编号
    const caseNo = await nextCaseNo();

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
