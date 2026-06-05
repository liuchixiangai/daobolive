-- AlterTable
ALTER TABLE "cases" ADD COLUMN "sourceApplicationNo" TEXT;

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appNo" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "commitmentAgreed" BOOLEAN NOT NULL,
    "commitmentVersion" TEXT NOT NULL DEFAULT 'v1.0',
    "commitmentAgreedAt" DATETIME NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_appNo_key" ON "applications"("appNo");
