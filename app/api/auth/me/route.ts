import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get("x-admin-id");
    if (!adminId) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        role: true,
        disabled: true,
        createdAt: true,
      },
    });

    if (!admin || admin.disabled) {
      return NextResponse.json({ error: "账号不可用" }, { status: 403 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
