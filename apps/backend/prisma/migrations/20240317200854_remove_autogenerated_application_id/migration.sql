/*
  Warnings:

  - You are about to drop the column `applicationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_applicationId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "applicationId";

-- CreateTable
CREATE TABLE "_collaborator" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_collaborator_AB_unique" ON "_collaborator"("A", "B");

-- CreateIndex
CREATE INDEX "_collaborator_B_index" ON "_collaborator"("B");

-- AddForeignKey
ALTER TABLE "_collaborator" ADD CONSTRAINT "_collaborator_A_fkey" FOREIGN KEY ("A") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_collaborator" ADD CONSTRAINT "_collaborator_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
