-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "adminName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "caseNo" TEXT,
    "ip" TEXT,
    "result" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "adminId", "adminName", "caseNo", "createdAt", "id", "ip", "note", "result") SELECT "action", "adminId", "adminName", "caseNo", "createdAt", "id", "ip", "note", "result" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
