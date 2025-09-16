/*
  Warnings:

  - A unique constraint covering the columns `[userID,guildID,year,month]` on the table `NwordCount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `NwordCount_userID_guildID_key` ON `NwordCount`;

-- CreateIndex
CREATE UNIQUE INDEX `NwordCount_userID_guildID_year_month_key` ON `NwordCount`(`userID`, `guildID`, `year`, `month`);
