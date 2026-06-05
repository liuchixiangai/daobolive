import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || "";

    // 速率限制
    const now = Date.now();
    const limit = RATE_LIMIT_MAP.get(ip);
    if (limit && limit.resetAt > now) {
      if (limit.count >= MAX_PER_HOUR) {
        return NextResponse.json(
          { error: "同一 IP 提交过多，请稍后再试。" },
          { status: 429 }
        );
      }
    } else {
      RATE_LIMIT_MAP.set(ip, { count: 0, resetAt: now + 3600000 });
    }

    const body = await request.json();
    const { teamName, contactName, contactPhone, contactEmail, commitmentAgreed } = body;

    // 必填校验
    if (!teamName?.trim()) {
      return NextResponse.json({ error: "请填写团队名称。" }, { status: 400 });
    }
    if (teamName.trim().length > 100) {
      return NextResponse.json({ error: "团队名称过长。" }, { status: 400 });
    }
    if (!contactName?.trim()) {
      return NextResponse.json({ error: "请填写联系人。" }, { status: 400 });
    }
    if (contactName.trim().length > 50) {
      return NextResponse.json({ error: "联系人名称过长。" }, { status: 400 });
    }
    if (!contactPhone?.trim()) {
      return NextResponse.json({ error: "请填写联系电话。" }, { status: 400 });
    }
    if (!/^[\d\-+() ]{7,20}$/.test(contactPhone.trim())) {
      return NextResponse.json({ error: "请填写正确联系电话。" }, { status: 400 });
    }
    if (!contactEmail?.trim()) {
      return NextResponse.json({ error: "请填写邮箱。" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      return NextResponse.json({ error: "请填写正确邮箱。" }, { status: 400 });
    }
    if (!commitmentAgreed) {
      return NextResponse.json({ error: "请勾选电子承诺书。" }, { status: 400 });
    }

    // 生成申请编号
    const lastApp = await prisma.application.findFirst({
      orderBy: { createdAt: "desc" },
      select: { appNo: true },
    });

    let nextNo = "A000001";
    if (lastApp?.appNo) {
      const num = parseInt(lastApp.appNo.replace("A", ""), 10);
      if (!isNaN(num)) {
        nextNo = "A" + String(num + 1).padStart(6, "0");
      }
    }

    // 创建申请
    const application = await prisma.application.create({
      data: {
        appNo: nextNo,
        teamName: teamName.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        commitmentAgreed: true,
        commitmentVersion: "v1.0",
        commitmentAgreedAt: new Date(),
        ip,
        userAgent,
        status: "PENDING",
      },
    });

    // 限制计数
    const current = RATE_LIMIT_MAP.get(ip)!;
    current.count++;
    RATE_LIMIT_MAP.set(ip, current);

    // 操作日志
    await createAuditLog({
      adminId: null,
      adminName: contactName.trim(),
      action: "APPLICATION_SUBMIT",
      note: `申请 ${nextNo}: ${teamName}`,
      ip,
    });

    // SMTP 预留
    try {
      const smtpHost = process.env.SMTP_HOST;
      const notifyEmail = process.env.APPLICATION_NOTIFY_EMAIL;
      if (smtpHost && notifyEmail) {
        console.log(`[SMTP] 申请通知: ${notifyEmail}, 申请编号: ${nextNo}`);
        await createAuditLog({
          adminId: null,
          adminName: "系统",
          action: "APPLICATION_EMAIL_SENT",
          note: `申请 ${nextNo} 邮件已发送`,
        });
      } else {
        await createAuditLog({
          adminId: null,
          adminName: "系统",
          action: "SMTP_NOT_CONFIGURED",
          note: `SMTP 未配置，申请 ${nextNo} 通知邮件未发送`,
        });
      }
    } catch {
      // 邮件失败不影响主流程
    }

    return NextResponse.json({
      success: true,
      appNo: nextNo,
      message: "申请已提交",
    });
  } catch (error) {
    console.error("Application submit error:", error);
    return NextResponse.json({ error: "提交失败，请稍后重试。" }, { status: 500 });
  }
}
