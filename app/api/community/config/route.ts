import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/community/config — 公开社群配置（用于申请页引导）
export async function GET() {
  try {
    const config = await prisma.communityConfig.findFirst({
      select: {
        adminWechat: true,
        wechatQrUrl: true,
        showWechat: true,
        qqGroupNo: true,
        qqGroupUrl: true,
        qqQrUrl: true,
        showQqGroup: true,
      },
    });

    return NextResponse.json(config || {});
  } catch {
    return NextResponse.json({});
  }
}
