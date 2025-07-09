/*
  Warnings:

  - Added the required column `affectedApplicationName` to the `ApplicationAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserDisplayName` to the `ApplicationAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserUsername` to the `ApplicationAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserDisplayName` to the `SystemAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserUsername` to the `SystemAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `affectedUserDisplayName` to the `UserAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `affectedUserUsername` to the `UserAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserDisplayName` to the `UserAuditLogEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executingUserUsername` to the `UserAuditLogEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApplicationAuditLogEntry" ADD COLUMN     "affectedApplicationName" TEXT NOT NULL,
ADD COLUMN     "executingUserDisplayName" TEXT NOT NULL,
ADD COLUMN     "executingUserUsername" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SystemAuditLogEntry" ADD COLUMN     "executingUserDisplayName" TEXT NOT NULL,
ADD COLUMN     "executingUserUsername" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserAuditLogEntry" ADD COLUMN     "affectedUserDisplayName" TEXT NOT NULL,
ADD COLUMN     "affectedUserUsername" TEXT NOT NULL,
ADD COLUMN     "executingUserDisplayName" TEXT NOT NULL,
ADD COLUMN     "executingUserUsername" TEXT NOT NULL;
