/*
  Warnings:

  - Added the required column `channelId` to the `ChatMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lynx"."ChatMessages" ADD COLUMN     "channelId" TEXT NOT NULL;
