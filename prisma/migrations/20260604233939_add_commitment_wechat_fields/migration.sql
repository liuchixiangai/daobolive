-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseNo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "name" TEXT NOT NULL,
    "directorName" TEXT NOT NULL,
    "teamName" TEXT,
    "contactInfo" TEXT,
    "category" TEXT,
    "province" TEXT,
    "city" TEXT,
    "contactPerson" TEXT,
    "contactPhone" TEXT,
    "contactWechat" TEXT,
    "contactEmail" TEXT,
    "summary" TEXT,
    "teamDisplay" TEXT,
    "techTags" TEXT,
    "htmlContent" TEXT,
    "commitmentUploaded" BOOLEAN NOT NULL DEFAULT false,
    "commitmentFileName" TEXT,
    "commitmentFilePath" TEXT,
    "commitmentFileSize" INTEGER,
    "commitmentFileType" TEXT,
    "commitmentUploadedAt" DATETIME,
    "commitmentUploadedBy" TEXT,
    "wechatVerified" BOOLEAN NOT NULL DEFAULT false,
    "wechatVerifiedAt" DATETIME,
    "wechatVerifiedById" TEXT,
    "wechatVerifiedNote" TEXT,
    "accessCodeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "accessCode" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cases_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "admins" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cases_wechatVerifiedById_fkey" FOREIGN KEY ("wechatVerifiedById") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_cases" ("accessCode", "accessCodeEnabled", "caseNo", "category", "city", "commitmentUploaded", "contactEmail", "contactInfo", "contactPerson", "contactPhone", "contactWechat", "createdAt", "creatorId", "directorName", "htmlContent", "id", "name", "province", "status", "summary", "teamDisplay", "teamName", "techTags", "updatedAt", "wechatVerified") SELECT "accessCode", "accessCodeEnabled", "caseNo", "category", "city", "commitmentUploaded", "contactEmail", "contactInfo", "contactPerson", "contactPhone", "contactWechat", "createdAt", "creatorId", "directorName", "htmlContent", "id", "name", "province", "status", "summary", "teamDisplay", "teamName", "techTags", "updatedAt", "wechatVerified" FROM "cases";
DROP TABLE "cases";
ALTER TABLE "new_cases" RENAME TO "cases";
CREATE UNIQUE INDEX "cases_caseNo_key" ON "cases"("caseNo");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
