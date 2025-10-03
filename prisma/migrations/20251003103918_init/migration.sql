-- CreateTable
CREATE TABLE `users` (
    `userId` VARCHAR(191) NOT NULL,
    `githubId` BIGINT NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_githubId_key`(`githubId`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `todos` (
    `todoId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('open', 'done') NOT NULL DEFAULT 'open',
    `priority` ENUM('low', 'mid', 'high') NOT NULL DEFAULT 'mid',
    `due` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `todos_userId_updatedAt_idx`(`userId`, `updatedAt`),
    INDEX `todos_userId_status_idx`(`userId`, `status`),
    INDEX `todos_userId_priority_idx`(`userId`, `priority`),
    INDEX `todos_userId_due_idx`(`userId`, `due`),
    FULLTEXT INDEX `todos_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`todoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `todos` ADD CONSTRAINT `todos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
