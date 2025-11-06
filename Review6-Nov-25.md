# Review 6-Nov-25

## Directory Review

- Root pages
  - `index.html:1` — Landing; loads layout via `js/layout-loader.js:1`.
  - `directory.html:1` — Booth directory; styled by `css/directory.css:1`.
  - `booths/booth1.html:1`, `booths/booth2.html:1`, `booths/booth3.html:1`, `booths/booth4.html:1` — Booth placeholders.
  - `feedback.html:1` — Feedback form + modal; uses `js/feedback.js:1`.
  - `login.html:1`, `registration.html:1` — Auth forms.
  - `registration-summary.html:1`, `feedback-summary.html:1` — Admin summaries (rendered by `js/admin-loader.js:1`).
- Components
  - `component/header.html:1`, `component/footer.html:1`, `component/fireworks.html:1` — Loaded by `js/layout-loader.js:1`.
- Styles
  - `css/style.css:1`, `css/directory.css:1`, `css/feedback.css:1`, `css/homepage.css:1`, `css/form.css:1`, `css/booth.css:1`.
- Scripts
  - `js/layout-loader.js:1`, `js/auth.js:1`, `js/login.js:1`, `js/registration.js:1`, `js/feedback.js:1`, `js/admin-loader.js:1`, `js/UserProfile.js:1`.
- Database
  - `sql/schema.sql:1` — Schema + dev seed.
- API
  - `api/index.php:1`, `api/bootstrap.php:1`, `api/.htaccess:1`, `api/README.md:1`.
  - Controllers: `api/app/Controllers/AuthController.php:1`, `FeedbackController.php:1`, `SummaryController.php:1`.
  - Libs: `api/lib/response.php:1`, `api/lib/db.php:1`, `api/lib/auth.php:1`, `api/lib/session.php:1`.
  - Config: `api/config/database.php:1`, `api/config/README.md:1`.

## Backend

- Routing
  - Front controller map in `api/index.php:29` (supports both clean paths and `.php` suffixes).
- Controllers
  - Auth — `AuthController.php:8` login, `:41` register, `:110` me, `:117` logout.
  - Feedback — `FeedbackController.php:8` create, `:46` list (admin).
  - Summary — `SummaryController.php:6` registrations, `:19` feedback aggregates.
- Libraries & bootstrap
  - JSON helpers `api/lib/response.php:1`; PDO `api/lib/db.php:1`; session/auth `api/lib/auth.php:1`, `api/lib/session.php:1`.
  - Environment/timezone/error handling `api/bootstrap.php:4`.
- Database
  - Schema + seed `sql/schema.sql:1` (users, feedback, admin dev accounts).
- Improvements
  - CSRF tokens for state-changing POST; rate limit login.
  - Validate confirm password server-side; enrich 422 field errors.
  - Define/apply CORS policy (origins/methods/credentials) if cross-origin.
  - Add indexes for frequent queries (`created_at`, etc.).

## Frontend

- Pages & components
  - Layout components loaded by `js/layout-loader.js:1` — `component/header.html:1`, `footer.html:1`, `fireworks.html:1`.
  - Pages — `index.html:1`, `directory.html:1`, `booths/*.html`, `feedback.html:1`, `login.html:1`, `registration.html:1`, `registration-summary.html:1`, `feedback-summary.html:1`.
- JavaScript
  - Auth state/UI `js/auth.js:1`; login `js/login.js:1`; register `js/registration.js:1`.
  - Admin summaries `js/admin-loader.js:1` (calls `/api/auth/me.php`, `/api/summary/*`).
  - Layout loader `js/layout-loader.js:1`; profile dropdown `js/UserProfile.js:1`.
  - Feedback form `js/feedback.js:1` (currently UI-only; not calling API).
- Styles
  - Global/header/footer `css/style.css:1`; directory `css/directory.css:1`; homepage/fireworks `css/homepage.css:1`;
    feedback `css/feedback.css:1`; `css/form.css:1` and `css/booth.css:1` are empty/placeholders.
- Improvements
  - Centralize Bootstrap bundle load in `js/layout-loader.js:1` to avoid per-page duplication. Remove page-level Bootstrap scripts if present (e.g., from `feedback.html:1`).
  - Include `css/homepage.css:1` on pages that render `#fireworks-placeholder`.
  - Fix encoding glitches in `directory.html:1` and `booths/*.html:1` text/comments.
  - Wire `js/feedback.js:1` to POST `api/feedback/create.php` and show API result.
  - Add shared `apiFetch()` wrapper; replace `alert()` with inline alerts/toasts.
  - Fill missing styles or remove unused `css/form.css:1`, `css/booth.css:1`.

## Code Review

- Bootstrap loading
  - Moved Bootstrap bundle loading to `js/layout-loader.js:1` (loads from CDN once and emits `bootstrap:ready`).
  - Updated `js/feedback.js:1` to wait for `window.bootstrap` if needed; prevents race condition without per-page includes.
- Feedback modal
  - `js/feedback.js:1` now guards when Modal is unavailable and retries on `bootstrap:ready`.
- Cleanup
  - If any page contains `<script src="...bootstrap*.js">`, remove it to avoid duplicate loading.
- Next
  - Connect feedback form to API endpoint and handle responses.
  - Fix text encoding issues in directory/booth files.

## Config Overview

- Docs: `api/config/README.md:1`
- Runtime: `api/config/database.php:1`
- Bootstrap env: `api/bootstrap.php:4`

### Environment Variables
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` — Database connection settings.
- `APP_TZ` — Default timezone (e.g., Asia/Bangkok).
- `APP_DEBUG` — Set to `1` in development to display errors.

### Next Steps
- Define CORS policy and apply centrally.
- Provide local dev setup notes (XAMPP/MariaDB) and sample env.
- Keep secrets in environment; verify production overrides.
