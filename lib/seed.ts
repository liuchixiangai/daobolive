import "dotenv/config";
import { prisma } from "./prisma";
import { hashPassword } from "./auth";
import { initCounters } from "./counter-init";

const FORBIDDEN_PASSWORDS = ["admin123", "admin", "password", "123456", "12345678"];

async function main() {
  console.log("Seeding database...");

  const username = process.env.ADMIN_INIT_USERNAME;
  const password = process.env.ADMIN_INIT_PASSWORD;

  if (!username || !password) {
    console.log("ADMIN_INIT_USERNAME or ADMIN_INIT_PASSWORD not set, skipping admin creation.");
  } else {
    if (FORBIDDEN_PASSWORDS.includes(password)) {
      console.error("ERROR: ADMIN_INIT_PASSWORD is a forbidden default password. Refusing to create admin.");
      process.exit(1);
    }
    if (password.length < 8) {
      console.error("ERROR: ADMIN_INIT_PASSWORD must be at least 8 characters.");
      process.exit(1);
    }

    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      console.log(`Admin "${username}" already exists, skipping.`);
    } else {
      const hashedPassword = await hashPassword(password);
      await prisma.admin.create({
        data: { username, password: hashedPassword, role: "SUPER_ADMIN" },
      });
      console.log(`Super admin "${username}" created.`);
    }
  }

  // 创建默认社群配置
  const configCount = await prisma.communityConfig.count();
  if (configCount === 0) {
    await prisma.communityConfig.create({
      data: {
        name: "导播星球社群",
        summary: "欢迎加入导播星球社群，与全国导播同行交流学习。",
        adminWechat: "请配置管理员微信",
        joinInstruction: "扫描二维码或搜索微信号添加管理员，备注【导播星球】即可加入。",
        rules: "1. 禁止发布违法内容\n2. 禁止恶意广告\n3. 尊重他人，文明交流",
        suitableFor: "导播从业者、直播技术人员、活动策划人员",
        unsuitableFor: "非行业相关人员、广告推广人员",
        isOpen: true,
      },
    });
    console.log("Default community config created.");
  }

  // 初始化编号计数器（从已有数据回填）
  await initCounters();

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
