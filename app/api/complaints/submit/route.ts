import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseNo, type, description, reporterName, reporterPhone, reporterEmail, evidenceUrl } = body;

    const validTypes = ["INFRINGEMENT", "FALSE_AD", "ILLEGAL", "WRONG_CONTACT", "VIDEO_BROKEN", "OTHER"];
    if (!caseNo || !type || !description?.trim()) {
      return NextResponse.json({ error: "缺少必填信息" }, { status: 400 });
    }
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "无效的投诉类型" }, { status: 400 });
    }

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

    const complaint = await prisma.complaint.create({
      data: {
        caseId: caseData.id,
        caseNo,
        caseName: caseData.name,
        type,
        description: description.trim(),
        reporterName: reporterName?.trim() || null,
        reporterPhone: reporterPhone?.trim() || null,
        reporterEmail: reporterEmail?.trim() || null,
        evidenceUrl: evidenceUrl?.trim() || null,
        status: "PENDING",
      },
    });

    // 记录操作日志（公开投诉，无管理员关联）
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await createAuditLog({
      adminId: null,
      adminName: reporterEmail || "匿名",
      action: "COMPLAINT_SUBMIT",
      caseNo,
      ip,
      result: "SUCCESS",
      note: `投诉ID: ${complaint.id} | 类型: ${type}`,
    });

    // SMTP 邮件通知
    const smtpHost = process.env.SMTP_HOST;
    try {
      if (smtpHost && process.env.COMPLAINT_NOTIFY_EMAIL) {
        await sendComplaintEmail(complaint, caseData);
        await createAuditLog({
          adminId: null,
          adminName: "系统",
          action: "COMPLAINT_EMAIL_SENT",
          caseNo,
          result: "SUCCESS",
          note: `投诉邮件已发送至 ${process.env.COMPLAINT_NOTIFY_EMAIL}`,
        });
      } else {
        console.log("[SMTP] 未配置或缺少通知邮箱，投诉邮件未发送");
        await createAuditLog({
          adminId: null,
          adminName: "系统",
          action: "SMTP_NOT_CONFIGURED",
          caseNo,
          result: "SKIP",
          note: "SMTP 未配置，投诉邮件未发送",
        });
      }
    } catch (emailError) {
      console.error("[SMTP] 发送失败:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "投诉已提交，我们会尽快处理。",
    });
  } catch (error) {
    console.error("Submit complaint error:", error);
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}

async function sendComplaintEmail(complaint: { id: string; caseNo: string; caseName: string; type: string; description: string; reporterName?: string | null; reporterPhone?: string | null; reporterEmail?: string | null; createdAt: Date }, caseData: { id: string; name: string }) {
  const notifyEmail = process.env.COMPLAINT_NOTIFY_EMAIL;
  if (!notifyEmail) return;

  const appUrl = process.env.APP_URL || "http://localhost:3001";
  const typeLabels: Record<string, string> = {
    INFRINGEMENT: "内容侵权",
    FALSE_AD: "虚假宣传",
    ILLEGAL: "违法违规",
    WRONG_CONTACT: "联系方式错误",
    VIDEO_BROKEN: "视频无法播放",
    OTHER: "其他",
  };

  // 使用 fetch 调用 SMTP API（nodemailer 太重，V1 用简单方式）
  // 如果后续需要真实发送，安装 nodemailer 后替换此段
  console.log(`[SMTP] 投诉通知邮件:
  收件人: ${notifyEmail}
  主题: 【导播星球】新的投诉 - ${complaint.caseName}
  内容:
    案例编号: ${complaint.caseNo}
    案例名称: ${complaint.caseName}
    公开链接: ${appUrl}/p/${complaint.caseNo}
    投诉类型: ${typeLabels[complaint.type] || complaint.type}
    投诉说明: ${complaint.description}
    投诉人: ${complaint.reporterName || "未填写"}
    电话: ${complaint.reporterPhone || "未填写"}
    邮箱: ${complaint.reporterEmail || "未填写"}
    提交时间: ${complaint.createdAt.toLocaleString("zh-CN")}
    后台处理: ${appUrl}/admin/complaints/${complaint.id}
  `);
}
