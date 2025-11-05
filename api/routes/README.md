Routes (endpoints) — placeholders

auth/
- register.php: POST /api/auth/register
- login.php: POST /api/auth/login
- logout.php: POST /api/auth/logout
- me.php: GET /api/auth/me

feedback/
- create.php: POST /api/feedback
- list.php: GET /api/feedback (admin or owner policy to be defined)

summary/ (admin-only)
- registrations.php: GET /api/summary/registrations
- feedback.php: GET /api/summary/feedback

