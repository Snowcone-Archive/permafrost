/*
  Warnings:

  - You are about to drop the `AuditLogEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLogEntry" DROP CONSTRAINT "AuditLogEntry_affectedUserId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLogEntry" DROP CONSTRAINT "AuditLogEntry_executingUserId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLogEntry" DROP CONSTRAINT "AuditLogEntry_userId_fkey";

-- DropTable
DROP TABLE "AuditLogEntry";

-- CreateTable
CREATE TABLE "UserAuditLogEntry" (
    "id" TEXT NOT NULL,
    "executingUserId" TEXT NOT NULL,
    "affectedUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAuditLogEntry" (
    "id" TEXT NOT NULL,
    "executingUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationAuditLogEntry" (
    "id" TEXT NOT NULL,
    "executingUserId" TEXT NOT NULL,
    "affectedApplicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationAuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserAuditLogEntry" ADD CONSTRAINT "UserAuditLogEntry_executingUserId_fkey" FOREIGN KEY ("executingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuditLogEntry" ADD CONSTRAINT "UserAuditLogEntry_affectedUserId_fkey" FOREIGN KEY ("affectedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAuditLogEntry" ADD CONSTRAINT "SystemAuditLogEntry_executingUserId_fkey" FOREIGN KEY ("executingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAuditLogEntry" ADD CONSTRAINT "ApplicationAuditLogEntry_executingUserId_fkey" FOREIGN KEY ("executingUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAuditLogEntry" ADD CONSTRAINT "ApplicationAuditLogEntry_affectedApplicationId_fkey" FOREIGN KEY ("affectedApplicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
