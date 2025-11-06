-- Create database (optional; ensure it exists)
CREATE DATABASE IF NOT EXISTS `g4_ourfestival` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `g4_ourfestival`;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(190) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `gender` ENUM('Male','Female','Other','Prefer not to say') NULL,
  `birth_day` TINYINT UNSIGNED NULL,
  `birth_month` TINYINT UNSIGNED NULL,
  `birth_year` SMALLINT UNSIGNED NULL,
  `phone_number` VARCHAR(30) NULL,
  `address` TEXT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_username` (`username`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Feedback table
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_user_id` (`user_id`),
  CONSTRAINT `fk_feedback_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================= DEV SEED START =============================
-- For development only.
-- Seed additional admins using student IDs as usernames (password: 'password')
-- No email specified (NULL)
INSERT INTO users (name, username, email, password_hash, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at)
VALUES
  ('Chanitnan Kitnantakhun', '6809616862', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Siwat Sangchan', '6809617449', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Jomthap samuhaseneeto', '6809617019', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Harit nilnoi', '6809616953', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Siwadol Arnamwat', '6809617431', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Parameth Suktast', '6809617233', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Chawisa Apiruknusit', '6809620062', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Anon Phoonsin', '6809681494', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW()),
  ('Theeranut Muangkram', '6809617191', NULL, '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', NULL, NULL, NULL, NULL, NULL, NULL, 'admin', NOW())
ON DUPLICATE KEY UPDATE role='admin', password_hash=VALUES(password_hash);
-- ============================== DEV SEED END ==============================
