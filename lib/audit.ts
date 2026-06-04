import { prisma } from "./prisma";

interface AuditLogInput {
  adminId: string;
  adminName: string;
  action: string;
  caseNo?: string;
  ip?: string;
  result?: string;
  note?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: input.adminId,
        adminName: input.adminName,
        action: input.action,
        caseNo: input.caseNo || null,
        ip: input.ip || null,
        result: input.result || "SUCCESS",
        note: input.note || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

/** 获取请求中的管理员信息（中间件注入的 headers） */
export function getAdminFromHeaders(headers: Headers) {
  return {
    id: headers.get("x-admin-id") || "",
    username: headers.get("x-admin-username") || "",
    role: headers.get("x-admin-role") || "",
  };
}
