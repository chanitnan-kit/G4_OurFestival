MySQL Schema (placeholder)

Tables to define:
- users: id, name, email (UNIQUE), password_hash, role ENUM('user','admin'), created_at
- feedback: id, user_id (FK users.id), rating INT, message TEXT, created_at

Indexes/constraints:
- users.email UNIQUE
- feedback.user_id FK with ON DELETE CASCADE

Seed data (optional):
- Create one admin account for initial access

