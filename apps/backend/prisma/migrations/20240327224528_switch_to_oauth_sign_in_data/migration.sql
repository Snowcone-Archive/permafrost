/*
  Warnings:

  - You are about to drop the column `discordEnableLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `discordId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `discordUsername` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubEnableLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `githubUsername` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OAuthSignInPlatform" AS ENUM ('GitHub', 'Discord');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discordEnableLogin",
DROP COLUMN "discordId",
DROP COLUMN "discordUsername",
DROP COLUMN "githubEnableLogin",
DROP COLUMN "githubId",
DROP COLUMN "githubUsername";

-- CreateTable
CREATE TABLE "OAuthSignInData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "OAuthSignInPlatform" NOT NULL,
    "platformId" TEXT NOT NULL,
    "platformUsername" TEXT NOT NULL,
    "enableLogin" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OAuthSignInData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OAuthSignInData" ADD CONSTRAINT "OAuthSignInData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
