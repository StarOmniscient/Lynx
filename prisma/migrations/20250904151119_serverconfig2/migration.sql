/*
  Warnings:

  - A unique constraint covering the columns `[guildID]` on the table `ServerConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ServerConfig_guildID_key` ON `ServerConfig`(`guildID`);
