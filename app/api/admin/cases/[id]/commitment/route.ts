import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "commitments");
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// POST /api/admin/cases/[id]/commitment — 上传承诺书
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const existing = await prisma.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 PDF、JPG、PNG 格式" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 });
    }

    // 保存文件
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".pdf";
    const filename = `${existing.caseNo}_${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    // 更新案例
    await prisma.case.update({
      where: { id },
      data: {
        commitmentUploaded: true,
        commitmentFileName: file.name,
        commitmentFilePath: filename,
        commitmentFileSize: file.size,
        commitmentFileType: file.type,
        commitmentUploadedAt: new Date(),
        commitmentUploadedBy: admin.username,
      },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "UPLOAD_COMMITMENT",
      caseNo: existing.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `上传承诺书: ${file.name}`,
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("Upload commitment error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

// GET /api/admin/cases/[id]/commitment — 获取承诺书信息
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const caseData = await prisma.case.findUnique({
      where: { id },
      select: {
        commitmentUploaded: true,
        commitmentFileName: true,
        commitmentFileSize: true,
        commitmentFileType: true,
        commitmentUploadedAt: true,
        commitmentUploadedBy: true,
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Get commitment error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
