-- DropForeignKey
ALTER TABLE "ApplicationAuditLogEntry" DROP CONSTRAINT "ApplicationAuditLogEntry_affectedApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationAuditLogEntry" DROP CONSTRAINT "ApplicationAuditLogEntry_executingUserId_fkey";

-- DropForeignKey
ALTER TABLE "SystemAuditLogEntry" DROP CONSTRAINT "SystemAuditLogEntry_executingUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuditLogEntry" DROP CONSTRAINT "UserAuditLogEntry_affectedUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuditLogEntry" DROP CONSTRAINT "UserAuditLogEntry_executingUserId_fkey";
