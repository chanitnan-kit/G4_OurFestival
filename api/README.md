API Structure

- index.php
  - Front controller. Handles requests to `/api/index.php?r=...` and routes using an internal map to controllers (no per-file routes).
  - Loads `bootstrap.php` for error handling, autoloading and helpers.
- bootstrap.php
  - Global setup (timezone, debug, JSON exception handler, autoloader for `App\*`).
  - Loads shared libs: `response.php`, `db.php`, `auth.php`, `session.php`.
  - Provides helpers `request_method()` and `request_json()`.
- app/Controllers/
  - Domain logic grouped by controller classes.
  - `AuthController.php` (login, register, me, logout)
  - `FeedbackController.php` (create, list)
  - `SummaryController.php` (registrations, feedback)
- lib/
  - `response.php`: JSON helpers (`json_ok`, `json_error`).
  - `db.php`: PDO connection factory using `config/database.php`.
  - `auth.php`: session-based auth helpers and guards.
  - `session.php`: secure session bootstrapping.
- config/
  - `database.php`: DB settings with environment variable overrides.

Notes
- Prefer using controllers for shared logic and tests.
- Use PHP sessions (HttpOnly, SameSite=Lax; secure when HTTPS) and PDO prepared statements.
