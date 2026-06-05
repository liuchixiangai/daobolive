import { prisma } from "./prisma";

/**
 * 初始化 counter 表，从已有数据回填最大编号
 * 部署后首次启动时调用
 */
export async function initCounters() {
  try {
    // 回填 case_no
    const existingCase = await prisma.counter.findUnique({ where: { key: "case_no" } });
    if (!existingCase) {
      const maxCase = await prisma.case.findFirst({
        orderBy: { caseNo: "desc" },
        select: { caseNo: true },
      });
      const startValue = maxCase?.caseNo ? parseInt(maxCase.caseNo, 10) : 0;
      if (startValue > 0) {
        await prisma.counter.create({ data: { key: "case_no", value: startValue } });
        console.log(`[Counter] case_no initialized to ${startValue}`);
      }
    }

    // 回填 app_no
    const existingApp = await prisma.counter.findUnique({ where: { key: "app_no" } });
    if (!existingApp) {
      const maxApp = await prisma.application.findFirst({
        orderBy: { createdAt: "desc" },
        select: { appNo: true },
      });
      const startValue = maxApp?.appNo ? parseInt(maxApp.appNo.replace("A", ""), 10) : 0;
      if (startValue > 0) {
        await prisma.counter.create({ data: { key: "app_no", value: startValue } });
        console.log(`[Counter] app_no initialized to ${startValue}`);
      }
    }
  } catch (error) {
    console.error("[Counter] Init failed:", error);
  }
}
