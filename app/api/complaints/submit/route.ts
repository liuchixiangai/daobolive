import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseNo, type, description, reporterName, reporterPhone, reporterEmail, evidenceUrl } = body;

    if (!caseNo || !type || !description) {
      return NextResponse.json(
        { error: "缺少必填信息" },
        { status: 400 }
      );
    }

    // 查找案例
    const caseData = await prisma.case.findUnique({
      where: { caseNo },
      select: { id: true, name: true, status: true },
    });

    if (!caseData) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    if (caseData.status !== "PUBLISHED") {
      return NextResponse.json({ error: "该案例当前不可投诉" }, { status: 400 });
    }

    // 创建投诉
    const complaint = await prisma.complaint.create({
      data: {
        caseId: caseData.id,
        caseNo,
        caseName: caseData.name,
        type,
        description,
        reporterName: reporterName || null,
        reporterPhone: reporterPhone || null,
        reporterEmail: reporterEmail || null,
        evidenceUrl: evidenceUrl || null,
        status: "PENDING",
      },
    });

    // 记录操作日志
    await prisma.auditLog.create({
      data: {
        adminId: "system",
        adminName: "系统",
        action: "COMPLAINT_SUBMIT",
        caseNo,
        ip:
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "unknown",
        result: "SUCCESS",
        note: `投诉ID: ${complaint.id}`,
      },
    });

    // SMTP 通知（如果配置了）
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      // TODO: 实际发送邮件
      console.log(`[SMTP] Would send complaint notification for case ${caseNo}`);
    } else {
      console.log("[SMTP] SMTP 未配置，邮件未发送");
    }

    return NextResponse.json({
      success: true,
      message: "投诉已提交，我们会尽快处理。",
    });
  } catch (error) {
    console.error("Submit complaint error:", error);
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
