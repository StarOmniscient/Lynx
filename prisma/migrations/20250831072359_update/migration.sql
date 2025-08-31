/*
  Warnings:

  - Added the required column `guilID` to the `HomeworkExists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildID` to the `Timeline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HomeworkExists` ADD COLUMN `guilID` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Timeline` ADD COLUMN `guildID` TEXT NOT NULL;
