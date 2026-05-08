-- CreateTable
CREATE TABLE `users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `email_verified` TINYINT NOT NULL DEFAULT 0,
    `phone` VARCHAR(20) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'Owner', 'Customer') NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Blocked') NOT NULL DEFAULT 'Pending',
    `approved` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pensions` (
    `pension_id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `owner_info` TEXT NULL,
    `room_details` TEXT NULL,
    `packages` JSON NULL,
    `package_images` JSON NULL,
    `city` VARCHAR(100) NULL,
    `sub_city` VARCHAR(50) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `region` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL DEFAULT 'Ethiopia',
    `address` TEXT NULL,
    `capacity` INTEGER NULL DEFAULT 0,
    `image_url` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
    `rejection_reason` TEXT NULL,
    `reviewed_by` INTEGER NULL,
    `reviewed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name_ml` JSON NULL,
    `description_ml` JSON NULL,
    `owner_info_ml` JSON NULL,
    `room_details_ml` JSON NULL,

    PRIMARY KEY (`pension_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `room_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pension_id` INTEGER NOT NULL,
    `owner_id` INTEGER NULL,
    `room_type` VARCHAR(100) NULL,
    `room_type_ml` JSON NULL,
    `number_of_beds` INTEGER NULL,
    `capacity` INTEGER NULL,
    `price_per_night` DECIMAL(10, 2) NULL,
    `availability_status` ENUM('Available', 'Occupied', 'Maintenance', 'Blocked') NULL,
    `last_status_update` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `package_id` INTEGER NULL,
    `room_number` VARCHAR(50) NULL,

    PRIMARY KEY (`room_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `booking_id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NULL,
    `customer_id` INTEGER NULL,
    `check_in_date` DATETIME(3) NULL,
    `check_out_date` DATETIME(3) NULL,
    `actual_check_out` DATETIME(3) NULL,
    `actual_check_in` DATETIME(3) NULL,
    `total_price` DECIMAL(10, 2) NULL,
    `status` ENUM('Pending', 'Confirmed', 'Cancelled', 'Completed') NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `id_document_url` VARCHAR(255) NULL,
    `pass_code` VARCHAR(10) NULL,
    `room_number` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `is_walk_in` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`booking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `review_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pension_id` INTEGER NOT NULL,
    `booking_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `reviews_booking_id_key`(`booking_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('new_booking', 'booking_confirmed', 'booking_cancelled', 'review_received', 'pension_approved', 'pension_rejected', 'checkout', 'system') NULL DEFAULT 'system',
    `is_read` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packages` (
    `package_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pension_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `name_ml` JSON NULL,
    `description` TEXT NULL,
    `description_ml` JSON NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `duration_days` INTEGER NULL DEFAULT 1,
    `inclusions` JSON NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`package_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `staff_id` INTEGER NOT NULL AUTO_INCREMENT,
    `pension_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `position` VARCHAR(50) NULL,
    `salary` DECIMAL(10, 2) NULL,
    `hire_date` DATE NULL,
    `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`staff_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `expense_id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NULL,
    `amount` DECIMAL(10, 2) NULL,
    `category` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `expense_date` DATETIME(3) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`expense_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ownerprofiles` (
    `owner_id` INTEGER NOT NULL,
    `business_name` VARCHAR(100) NULL,
    `business_email` VARCHAR(255) NULL,
    `business_phone` VARCHAR(20) NULL,
    `license_number` VARCHAR(100) NULL,
    `id_document_url` VARCHAR(255) NULL,
    `approval_status` ENUM('Pending', 'Approved', 'Rejected') NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expiry_date` DATE NULL,

    PRIMARY KEY (`owner_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emailnotifications` (
    `email_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `subject` VARCHAR(150) NULL,
    `message` TEXT NULL,
    `status` ENUM('Pending', 'Sent', 'Failed') NULL DEFAULT 'Pending',
    `sent_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`email_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roomavailabilitylogs` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `changed_by` INTEGER NOT NULL,
    `old_status` ENUM('Available', 'Occupied', 'Maintenance', 'Blocked') NULL,
    `new_status` ENUM('Available', 'Occupied', 'Maintenance', 'Blocked') NULL,
    `changed_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translations` (
    `translation_id` INTEGER NOT NULL AUTO_INCREMENT,
    `source_text` VARCHAR(500) NOT NULL,
    `translated_text` TEXT NOT NULL,
    `source_language` VARCHAR(5) NULL DEFAULT 'en',
    `target_language` VARCHAR(5) NOT NULL,
    `translation_method` ENUM('google', 'manual') NULL DEFAULT 'google',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `translations_source_text_target_language_key`(`source_text`, `target_language`),
    PRIMARY KEY (`translation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translation_cache` (
    `cache_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cache_key` VARCHAR(255) NOT NULL,
    `cache_value` JSON NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `translation_cache_cache_key_key`(`cache_key`),
    PRIMARY KEY (`cache_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_cache` (
    `cache_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_lat` DECIMAL(10, 8) NOT NULL,
    `user_lng` DECIMAL(11, 8) NOT NULL,
    `radius_km` INTEGER NOT NULL,
    `cached_results` JSON NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expires_at` TIMESTAMP(0) NULL,

    INDEX `idx_location_cache_coords`(`user_lat`, `user_lng`, `radius_km`),
    PRIMARY KEY (`cache_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_location_preferences` (
    `preference_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `default_city` VARCHAR(100) NULL,
    `default_region` VARCHAR(100) NULL,
    `search_radius_km` INTEGER NULL DEFAULT 50,
    `location_sharing` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_location_preferences_user_id_key`(`user_id`),
    PRIMARY KEY (`preference_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pensions` ADD CONSTRAINT `pensions_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_pension_id_fkey` FOREIGN KEY (`pension_id`) REFERENCES `pensions`(`pension_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_pension_id_fkey` FOREIGN KEY (`pension_id`) REFERENCES `pensions`(`pension_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `packages` ADD CONSTRAINT `packages_pension_id_fkey` FOREIGN KEY (`pension_id`) REFERENCES `pensions`(`pension_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `staff_pension_id_fkey` FOREIGN KEY (`pension_id`) REFERENCES `pensions`(`pension_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ownerprofiles` ADD CONSTRAINT `ownerprofiles_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emailnotifications` ADD CONSTRAINT `emailnotifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roomavailabilitylogs` ADD CONSTRAINT `roomavailabilitylogs_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`room_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roomavailabilitylogs` ADD CONSTRAINT `roomavailabilitylogs_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_location_preferences` ADD CONSTRAINT `user_location_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
