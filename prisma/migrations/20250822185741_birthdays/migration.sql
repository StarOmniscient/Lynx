-- CreateTable
CREATE TABLE `Birthdays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userID` TEXT NOT NULL,
    `date` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
