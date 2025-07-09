/*
  Warnings:

  - The values [ReadPublic,ReadPrivate] on the enum `AuthorizationPermissions` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthorizationPermissions_new" AS ENUM ('profile', 'email');
ALTER TABLE "Authorization" ALTER COLUMN "permissions" DROP DEFAULT;
ALTER TABLE "Authorization" ALTER COLUMN "permissions" TYPE "AuthorizationPermissions_new"[] USING ("permissions"::text::"AuthorizationPermissions_new"[]);
ALTER TYPE "AuthorizationPermissions" RENAME TO "AuthorizationPermissions_old";
ALTER TYPE "AuthorizationPermissions_new" RENAME TO "AuthorizationPermissions";
DROP TYPE "AuthorizationPermissions_old";
COMMIT;

-- AlterTable
ALTER TABLE "Authorization" ALTER COLUMN "permissions" DROP DEFAULT;
