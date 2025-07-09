-- CreateEnum
CREATE TYPE "AuthenticationMethod" AS ENUM ('Email', 'GitHub', 'Discord');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "authenticationMethod" "AuthenticationMethod";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "discordEnableLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discordUsername" TEXT,
ADD COLUMN     "githubEnableLogin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubUsername" TEXT;
