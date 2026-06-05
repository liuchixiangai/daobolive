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

// 登录失败限速（IP + 用户名）
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 分钟

export function checkLoginRateLimit(ip: string, username: string): string | null {
  const now = Date.now();
  const key = `${ip}:${username}`;
  const entry = loginAttempts.get(key);

  if (entry && entry.lockUntil > now) {
    const remaining = Math.ceil((entry.lockUntil - now) / 60000);
    return `登录尝试过多，请 ${remaining} 分钟后再试。`;
  }
  return null;
}

export function recordLoginFailure(ip: string, username: string) {
  const key = `${ip}:${username}`;
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.lockUntil <= now) {
    loginAttempts.set(key, { count: 1, lockUntil: 0 });
  } else {
    entry.count++;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockUntil = now + LOCK_TIME;
    }
  }
}

export function clearLoginRateLimit(ip: string, username: string) {
  loginAttempts.delete(`${ip}:${username}`);
}

// 定时清理（每10分钟清理过期条目）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) {
    if (entry.lockUntil > 0 && entry.lockUntil <= now) {
      loginAttempts.delete(key);
    }
  }
}, 600000);
