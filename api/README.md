API Structure (scaffold only, no code)

- config/
  - Configuration placeholders (environment, database settings)
- lib/
  - Shared utilities (DB connection, session, auth middleware, validation, response)
- routes/
  - auth/: register, login, logout, me
  - feedback/: create, list
  - summary/: registrations, feedback (admin-only)
- sql/
  - MySQL schema and seed placeholders

Implementation notes
- Use PHP + MySQL (PDO) with prepared statements.
- Use PHP sessions (cookie HttpOnly, SameSite=Lax; enable secure under HTTPS).
- Enforce role checks on server for admin-only endpoints.

