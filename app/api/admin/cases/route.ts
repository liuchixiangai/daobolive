import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog, getAdminFromHeaders } from "@/lib/audit";
import { nextCaseNo } from "@/lib/counter";

// GET /api/admin/cases — 案例列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        include: {
          creator: { select: { id: true, username: true } },
        },
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      cases,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List cases error:", error);
    return NextResponse.json({ error: "获取案例列表失败" }, { status: 500 });
  }
}

// POST /api/admin/cases — 创建案例
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromHeaders(request.headers);
    if (!admin.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();

    // 验证必填字段
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "案例名称不能为空" }, { status: 400 });
    }
    if (!body.directorName?.trim()) {
      return NextResponse.json({ error: "导播姓名不能为空" }, { status: 400 });
    }
    if (!body.category?.trim()) {
      return NextResponse.json({ error: "活动分类不能为空" }, { status: 400 });
    }

    // 原子生成案例编号
    const caseNo = await nextCaseNo();

    const newCase = await prisma.case.create({
      data: {
        caseNo,
        name: body.name.trim(),
        directorName: body.directorName.trim(),
        teamName: body.teamName?.trim() || null,
        contactInfo: body.contactInfo?.trim() || null,
        category: body.category.trim(),
        province: body.province?.trim() || null,
        city: body.city?.trim() || null,
        contactPerson: body.contactPerson?.trim() || null,
        contactPhone: body.contactPhone?.trim() || null,
        contactWechat: body.contactWechat?.trim() || null,
        contactEmail: body.contactEmail?.trim() || null,
        summary: body.summary?.trim() || null,
        teamDisplay: body.teamDisplay?.trim() || null,
        techTags: body.techTags?.trim() || null,
        creatorId: admin.id,
      },
    });

    // 写入操作日志
    await createAuditLog({
      adminId: admin.id,
      adminName: admin.username,
      action: "CREATE_CASE",
      caseNo: newCase.caseNo,
      ip: request.headers.get("x-forwarded-for") || undefined,
      result: "SUCCESS",
      note: `创建导播案例: ${newCase.name}`,
    });

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error("Create case error:", error);
    return NextResponse.json({ error: "创建案例失败" }, { status: 500 });
  }
}
