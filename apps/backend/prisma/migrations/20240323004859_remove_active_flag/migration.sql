/*
  Warnings:

  - The values [Active] on the enum `AccountFlags` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountFlags_new" AS ENUM ('Disabled', 'RequiresPasswordChange', 'RequiresEmailVerification');
ALTER TABLE "User" ALTER COLUMN "flags" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "flags" TYPE "AccountFlags_new"[] USING ("flags"::text::"AccountFlags_new"[]);
ALTER TYPE "AccountFlags" RENAME TO "AccountFlags_old";
ALTER TYPE "AccountFlags_new" RENAME TO "AccountFlags";
DROP TYPE "AccountFlags_old";
ALTER TABLE "User" ALTER COLUMN "flags" SET DEFAULT ARRAY[]::"AccountFlags"[];
COMMIT;
