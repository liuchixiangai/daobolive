import { prisma } from "./prisma";

/**
 * 原子递增计数器，返回下一个编号
 * SQLite 用 upsert 模拟原子递增（SQLite 的 upsert 在 WRITE lock 下是原子的）
 * 重试机制处理唯一约束冲突（高并发下非常罕见）
 */
export async function nextNumber(key: string, startFrom: number = 1): Promise<number> {
  for (let retry = 0; retry < 3; retry++) {
    try {
      const counter = await prisma.counter.upsert({
        where: { key },
        create: { key, value: startFrom },
        update: { value: { increment: 1 } },
      });
      return counter.value;
    } catch (error: any) {
      // 并发冲突时重试
      if (retry < 2 && error?.code === "P2002") {
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate number after retries");
}

/** 生成案例编号 000001 */
export async function nextCaseNo(): Promise<string> {
  const num = await nextNumber("case_no");
  return String(num).padStart(6, "0");
}

/** 生成申请编号 A000001 */
export async function nextAppNo(): Promise<string> {
  const num = await nextNumber("app_no");
  return "A" + String(num).padStart(6, "0");
}
