import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ caseNo: string }> }
) {
  try {
    const { caseNo } = await params;
    const caseData = await prisma.case.findUnique({
      where: { caseNo },
    });

    if (!caseData) {
      return NextResponse.json({ error: "案例不存在" }, { status: 404 });
    }

    if (caseData.status !== "PUBLISHED") {
      return NextResponse.json({ error: "该案例暂不可访问" }, { status: 404 });
    }

    // 如果启用了访问码保护
    if (caseData.accessCodeEnabled) {
      return NextResponse.json({ needAccessCode: true });
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error("Get public case error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseNo: string }> }
) {
  try {
    const { caseNo } = await params;
    const { accessCode } = await request.json();

    const caseData = await prisma.case.findUnique({
      where: { caseNo },
    });

    if (!caseData || caseData.status !== "PUBLISHED") {
      return NextResponse.json({ error: "该案例暂不可访问" }, { status: 404 });
    }

    if (!caseData.accessCodeEnabled) {
      // 未启用访问码，但 status 已验证为 PUBLISHED
      return NextResponse.json({ case: caseData });
    }

    if (caseData.accessCode !== accessCode) {
      return NextResponse.json({ error: "访问码错误" }, { status: 403 });
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error("Access code verify error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
