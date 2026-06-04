import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import path from "path";
import { getAdminFromHeaders, createAuditLog } from "@/lib/audit";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "commitments");

// GET /api/admin/commitments/[filename] — 查看/下载承诺书（需登录）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { filename } = await params;
    // 防止路径穿越
    const safeName = path.basename(filename);
    const filepath = path.join(UPLOAD_DIR, safeName);

    // 检查文件是否存在
    try {
      await access(filepath);
    } catch {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const fileBuffer = await readFile(filepath);

    // 记录查看日志（异步，不阻塞响应）
    createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "VIEW_COMMITMENT",
      note: `查看承诺书: ${safeName}`,
    }).catch(() => {});

    // 根据扩展名设置 Content-Type
    const ext = path.extname(safeName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Content-Disposition": `inline; filename="${safeName}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Serve commitment error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
