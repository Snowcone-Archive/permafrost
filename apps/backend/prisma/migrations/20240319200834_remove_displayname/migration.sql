/*
  Warnings:

  - You are about to drop the column `executingUserDisplayName` on the `ApplicationAuditLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `executingUserDisplayName` on the `SystemAuditLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `affectedUserDisplayName` on the `UserAuditLogEntry` table. All the data in the column will be lost.
  - You are about to drop the column `executingUserDisplayName` on the `UserAuditLogEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ApplicationAuditLogEntry" DROP COLUMN "executingUserDisplayName";

-- AlterTable
ALTER TABLE "SystemAuditLogEntry" DROP COLUMN "executingUserDisplayName";

-- AlterTable
ALTER TABLE "UserAuditLogEntry" DROP COLUMN "affectedUserDisplayName",
DROP COLUMN "executingUserDisplayName";
