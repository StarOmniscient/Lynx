-- CreateTable
CREATE TABLE `HomeWorkChannels` (
    `guildId` VARCHAR(191) NOT NULL,
    `channels` JSON NOT NULL,

    PRIMARY KEY (`guildId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
