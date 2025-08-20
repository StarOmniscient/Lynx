-- CreateTable
CREATE TABLE `Timeline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `timeLineID` TEXT NOT NULL,
    `title` TEXT NOT NULL,
    `type` TEXT NOT NULL,
    `text` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
