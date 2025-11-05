(() => {
  const REGISTERED_KEY = "is_registered";
  const NAME_KEY = "register_name";
  const ROLE_KEY = "user_role";

  const byId = (id) => document.getElementById(id);
  const setStatus = (msg, kind = 'danger') => {
    const box = byId('login-message');
    if (!box) return;
    box.className = `alert alert-${kind}`;
    box.textContent = msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('', '');
    const identifier = (byId('identifier').value || '').trim();
    const password = byId('password').value || '';
    if (!identifier || !password) {
      setStatus('Please enter email/username and password.');
      return;
    }
    try {
      const res = await fetch('api/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || `Login failed (HTTP ${res.status})`;
        setStatus(msg);
        return;
      }
      const user = data.user || {};
      localStorage.setItem(REGISTERED_KEY, 'true');
      localStorage.setItem(NAME_KEY, user.name || '');
      localStorage.setItem(ROLE_KEY, user.role || 'user');
      if (typeof window.updateProfileUI === 'function') window.updateProfileUI();
      setStatus('Login successful. Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 500);
    } catch (err) {
      setStatus('Network error. Please try again.');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = byId('login-form');
    if (form) form.addEventListener('submit', handleSubmit);
  });
})();
