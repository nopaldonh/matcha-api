-- CreateTable
CREATE TABLE `tbl_user` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `phone_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,
    `deleted_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `tbl_user_username_key`(`username`),
    UNIQUE INDEX `tbl_user_email_key`(`email`),
    UNIQUE INDEX `tbl_user_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
