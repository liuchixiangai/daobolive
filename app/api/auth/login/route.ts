import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, checkLoginRateLimit, recordLoginFailure, clearLoginRateLimit } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    // 登录限速检查
    const rateLimitError = checkLoginRateLimit(ip, username);
    if (rateLimitError) {
      return NextResponse.json({ error: rateLimitError }, { status: 429 });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      recordLoginFailure(ip, username);
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    if (admin.disabled) {
      return NextResponse.json({ error: "账号已被禁用" }, { status: 403 });
    }

    const valid = await comparePassword(password, admin.password);
    if (!valid) {
      recordLoginFailure(ip, username);
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    clearLoginRateLimit(ip, username);

    // 签发 JWT
    const token = await signToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    // 记录登录日志
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.username,
        action: "LOGIN",
        ip,
        result: "SUCCESS",
      },
    });

    // 设置 cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
