import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";

    let cases;

    if (q) {
      // 模糊搜索已发布的案例
      cases = await prisma.case.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { caseNo: { contains: q } },
            { name: { contains: q } },
            { directorName: { contains: q } },
            { teamName: { contains: q } },
            { province: { contains: q } },
            { city: { contains: q } },
            { category: { contains: q } },
            { techTags: { contains: q } },
            { summary: { contains: q } },
            { teamDisplay: { contains: q } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          caseNo: true,
          name: true,
          directorName: true,
          teamName: true,
          category: true,
          province: true,
          city: true,
          techTags: true,
          summary: true,
          createdAt: true,
        },
      });
    } else {
      cases = await prisma.case.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          caseNo: true,
          name: true,
          directorName: true,
          teamName: true,
          category: true,
          province: true,
          city: true,
          techTags: true,
          summary: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Search cases error:", error);
    return NextResponse.json({ error: "搜索失败" }, { status: 500 });
  }
}
