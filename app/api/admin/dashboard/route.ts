import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const [caseTotal, publishedCount, draftCount, unpublishedCount, rejectedCount, pendingComplaints, pendingApplications, toolCount, communityConfig] =
      await Promise.all([
        prisma.case.count(),
        prisma.case.count({ where: { status: "PUBLISHED" } }),
        prisma.case.count({ where: { status: "DRAFT" } }),
        prisma.case.count({ where: { status: "UNPUBLISHED" } }),
        prisma.case.count({ where: { status: "REJECTED" } }),
        prisma.complaint.count({ where: { status: "PENDING" } }),
        prisma.application.count({ where: { status: "PENDING" } }),
        prisma.tool.count(),
        prisma.communityConfig.findFirst(),
      ]);

    return NextResponse.json({
      caseTotal,
      publishedCount,
      draftCount,
      unpublishedCount,
      rejectedCount,
      pendingComplaints,
      pendingApplications,
      toolCount,
      communityOpen: communityConfig?.isOpen ?? false,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
