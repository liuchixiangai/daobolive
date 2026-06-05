-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_community_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT '导播星球社群',
    "summary" TEXT,
    "adminWechat" TEXT,
    "joinInstruction" TEXT,
    "rules" TEXT,
    "suitableFor" TEXT,
    "unsuitableFor" TEXT,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "showWechat" BOOLEAN NOT NULL DEFAULT true,
    "wechatQrUrl" TEXT,
    "showQqGroup" BOOLEAN NOT NULL DEFAULT true,
    "qqGroupNo" TEXT,
    "qqGroupUrl" TEXT,
    "qqQrUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_community_configs" ("adminWechat", "createdAt", "id", "isOpen", "joinInstruction", "name", "rules", "suitableFor", "summary", "unsuitableFor", "updatedAt") SELECT "adminWechat", "createdAt", "id", "isOpen", "joinInstruction", "name", "rules", "suitableFor", "summary", "unsuitableFor", "updatedAt" FROM "community_configs";
DROP TABLE "community_configs";
ALTER TABLE "new_community_configs" RENAME TO "community_configs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
