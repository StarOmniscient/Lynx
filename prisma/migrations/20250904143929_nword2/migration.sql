/*
  Warnings:

  - A unique constraint covering the columns `[userID,guildID]` on the table `NwordCount` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `NwordCount` MODIFY `count` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `NwordCount_userID_guildID_key` ON `NwordCount`(`userID`, `guildID`);
