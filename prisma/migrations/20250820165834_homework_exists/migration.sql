-- CreateTable
CREATE TABLE `HomeworkExists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `superID` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `forumChannelID` VARCHAR(191) NOT NULL,
    `forumID` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
