/*
  Warnings:

  - Made the column `channelID` on table `Birthdays` required. This step will fail if there are existing NULL values in that column.
  - Made the column `guildID` on table `Birthdays` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Birthdays` MODIFY `channelID` TEXT NOT NULL,
    MODIFY `guildID` TEXT NOT NULL;
