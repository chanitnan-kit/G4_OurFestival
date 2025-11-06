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

-- Example users (IDs: 995-999)
INSERT INTO users (id, name, username, email, password_hash, gender, birth_day, birth_month, birth_year, phone_number, address, role, created_at)
VALUES
  (995, 'Example User 995', 'user995', 'user995@example.com', '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', 'Other', NULL, NULL, NULL, NULL, NULL, 'user', NOW()),
  (996, 'Example User 996', 'user996', 'user996@example.com', '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', 'Other', NULL, NULL, NULL, NULL, NULL, 'user', NOW()),
  (997, 'Example User 997', 'user997', 'user997@example.com', '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', 'Other', NULL, NULL, NULL, NULL, NULL, 'user', NOW()),
  (998, 'Example User 998', 'user998', 'user998@example.com', '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', 'Other', NULL, NULL, NULL, NULL, NULL, 'user', NOW()),
  (999, 'Example User 999', 'user999', 'user999@example.com', '$2y$10$.mJ8FObt4Q/vg7oCFrqU7.rLbeXwEAvIfblJSPGqzXUsykKI8Km2m', 'Other', NULL, NULL, NULL, NULL, NULL, 'user', NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name),
  email=VALUES(email),
  role=VALUES(role),
  password_hash=VALUES(password_hash);

-- Example feedback for users 995-999 (idempotent inserts)
INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 995, 5, 'Loved the booths!', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 995 AND comment = 'Loved the booths!'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 995, 4, 'Great vibe and music.', NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 995 AND comment = 'Great vibe and music.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 996, 3, 'Good, but could improve parking.', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 996 AND comment = 'Good, but could improve parking.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 996, 5, 'Amazing fireworks!', NOW() - INTERVAL 2 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 996 AND comment = 'Amazing fireworks!'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 997, 2, 'Too crowded at peak hours.', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 997 AND comment = 'Too crowded at peak hours.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 997, 4, 'Food stalls were nice.', NOW() - INTERVAL 3 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 997 AND comment = 'Food stalls were nice.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 998, 5, 'Best event of the year!', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 998 AND comment = 'Best event of the year!'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 998, 1, 'Long queues at entrance.', NOW() - INTERVAL 1 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 998 AND comment = 'Long queues at entrance.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 999, 3, 'Average experience.', NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 999 AND comment = 'Average experience.'
);

INSERT INTO feedback (user_id, rating, comment, created_at)
SELECT 999, 4, 'Loved the live performances.', NOW() - INTERVAL 4 DAY
WHERE NOT EXISTS (
  SELECT 1 FROM feedback WHERE user_id = 999 AND comment = 'Loved the live performances.'
);
-- ============================== DEV SEED END ==============================
