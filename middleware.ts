import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

// 不需要登录的路径
const PUBLIC_PATHS = [
  "/admin/login",
  "/api/auth/login",
  "/api/applications/submit",
  "/api/community/config",
];

// 前台公开路径
const FRONTEND_PUBLIC_PREFIXES = [
  "/p/",
  "/apply",
  "/complaint/",
  "/tools",
  "/community",
  "/search",
];

function isPublicPath(pathname: string): boolean {
  // 精确匹配
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }
  // 前台公开前缀
  if (FRONTEND_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return true;
  }
  // 静态资源
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return true;
  }
  // 首页
  if (pathname === "/") return true;

  // 投诉提交和公开案例 API
  if (pathname.startsWith("/api/cases/public") || pathname.startsWith("/api/complaints/submit")) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路径放行
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // API 保护
  if (pathname.startsWith("/api/")) {
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-id", payload.id);
    requestHeaders.set("x-admin-username", payload.username);
    requestHeaders.set("x-admin-role", payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // 后台页面保护
  const token = request.cookies.get("token")?.value;
  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
