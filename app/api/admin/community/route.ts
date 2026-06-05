import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/community
export async function GET() {
  const config = await prisma.communityConfig.findFirst();
  return NextResponse.json(config || {});
}

// PUT /api/admin/community
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = await prisma.communityConfig.findFirst();

    const data = {
      name: body.name ?? undefined,
      summary: body.summary ?? undefined,
      adminWechat: body.adminWechat ?? undefined,
      joinInstruction: body.joinInstruction ?? undefined,
      rules: body.rules ?? undefined,
      suitableFor: body.suitableFor ?? undefined,
      unsuitableFor: body.unsuitableFor ?? undefined,
      isOpen: body.isOpen ?? undefined,
      showWechat: body.showWechat ?? undefined,
      wechatQrUrl: body.wechatQrUrl ?? undefined,
      showQqGroup: body.showQqGroup ?? undefined,
      qqGroupNo: body.qqGroupNo ?? undefined,
      qqGroupUrl: body.qqGroupUrl ?? undefined,
      qqQrUrl: body.qqQrUrl ?? undefined,
    };

    if (config) {
      const updated = await prisma.communityConfig.update({ where: { id: config.id }, data });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.communityConfig.create({ data: data as any });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Update community config error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
