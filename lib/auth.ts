import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "daobolive-v1-fallback-secret") {
    throw new Error("JWT_SECRET 未配置或使用了不安全默认值，请设置环境变量 JWT_SECRET");
  }
  return new TextEncoder().encode(secret);
}

// 缓存 secret（不重复 throw）
let _cachedSecret: Uint8Array | null = null;
function jwtSecret(): Uint8Array {
  if (!_cachedSecret) _cachedSecret = getJwtSecret();
  return _cachedSecret;
}

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(jwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


// ============================================================
// RBAC 权限检查
// ============================================================

export function requireSuperAdmin(role: string | null | undefined): { error: string } | null {
  if (role !== "SUPER_ADMIN") {
    return { error: "权限不足，仅超级管理员可执行此操作" };
  }
  return null;
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "SUPER_ADMIN";
}
