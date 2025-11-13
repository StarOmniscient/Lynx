-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "lynx";

-- CreateTable
CREATE TABLE "lynx"."HomeworkExists" (
    "id" SERIAL NOT NULL,
    "superID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "forumChannelID" TEXT NOT NULL,
    "forumID" TEXT NOT NULL,
    "guilID" TEXT NOT NULL,

    CONSTRAINT "HomeworkExists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."HomeWorkChannels" (
    "guildId" TEXT NOT NULL,
    "channels" JSON NOT NULL,

    CONSTRAINT "HomeWorkChannels_pkey" PRIMARY KEY ("guildId")
);

-- CreateTable
CREATE TABLE "lynx"."Timeline" (
    "id" SERIAL NOT NULL,
    "timeLineID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "timeLineDate" TIMESTAMP(3) NOT NULL,
    "guildID" TEXT,
    "text" TEXT,

    CONSTRAINT "Timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."Birthdays" (
    "id" SERIAL NOT NULL,
    "userID" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "channelID" TEXT NOT NULL,
    "lastSent" TIMESTAMP(3),

    CONSTRAINT "Birthdays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."Log" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."NwordCount" (
    "id" SERIAL NOT NULL,
    "guildID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,

    CONSTRAINT "NwordCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."ServerConfig" (
    "id" SERIAL NOT NULL,
    "guildID" TEXT NOT NULL,
    "config" JSON NOT NULL,

    CONSTRAINT "ServerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lynx"."ChatMessages" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NwordCount_userID_guildID_year_month_key" ON "lynx"."NwordCount"("userID", "guildID", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "ServerConfig_guildID_key" ON "lynx"."ServerConfig"("guildID");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "lynx"."User"("name");
