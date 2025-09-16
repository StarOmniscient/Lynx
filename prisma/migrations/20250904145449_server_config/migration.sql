-- CreateTable
CREATE TABLE `ServerConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildID` VARCHAR(191) NOT NULL,
    `config` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
