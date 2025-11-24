(() => {
  const statusEl = document.getElementById('profile-status');
  const cardEl = document.getElementById('profile-card');
  const emptyEl = document.getElementById('profile-empty');

  const toggle = (el, show) => {
    if (!el) return;
    el.classList.toggle('d-none', !show);
  };

  const setStatus = (message = '', tone = 'info') => {
    if (!statusEl) return;
    statusEl.className = 'alert mt-3';
    if (!message) {
      statusEl.classList.add('d-none');
      statusEl.textContent = '';
      return;
    }
    statusEl.classList.remove('d-none');
    statusEl.classList.add(`alert-${tone}`);
    statusEl.textContent = message;
  };

  const setField = (key, value) => {
    document.querySelectorAll(`[data-field="${key}"]`).forEach((el) => {
      el.textContent = value;
    });
  };

  const normalizeText = (value, fallback = 'Not provided') => {
    if (value === null || value === undefined) return fallback;
    const text = String(value).trim();
    return text || fallback;
  };

  const formatDob = (user) => {
    const day = Number(user.birth_day);
    const month = Number(user.birth_month);
    const year = Number(user.birth_year);
    if (Number.isInteger(day) && Number.isInteger(month) && Number.isInteger(year) && day > 0 && month > 0 && year > 0) {
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthName = monthNames[month - 1] || String(month);
      return `${String(day).padStart(2, '0')} ${monthName} ${year}`;
    }
    return 'Not provided';
  };

  const formatDate = (value) => {
    if (!value) return 'Not provided';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const computeInitial = (name, username) => {
    const source = (name || username || '').trim();
    return source ? source.charAt(0).toUpperCase() : '?';
  };

  const updateRoleBadge = (role) => {
    const roleEls = document.querySelectorAll('[data-field="role"]');
    const label = normalizeText(role || 'user', 'user');
    roleEls.forEach((el) => {
      el.textContent = label;
      el.classList.toggle('is-admin', label.toLowerCase() === 'admin');
    });
  };

  const renderProfile = (user) => {
    if (!user) {
      renderAuthRequired();
      return;
    }
    const displayName = normalizeText(user.name || user.username || 'Guest', 'Guest');
    setField('initial', computeInitial(displayName, user.username));
    setField('name', displayName);
    setField('name-full', displayName);
    setField('username', user.username || '-');
    setField('email', normalizeText(user.email, 'Not provided'));
    setField('gender', normalizeText(user.gender, 'Not provided'));
    setField('dob', formatDob(user));
    setField('phone_number', normalizeText(user.phone_number, 'Not provided'));
    setField('address', normalizeText(user.address, 'Not provided'));
    setField('id', user.id ? `#${user.id}` : '-');
    setField('created_at', formatDate(user.created_at));
    updateRoleBadge(user.role);

    toggle(cardEl, true);
    toggle(emptyEl, false);
    setStatus('Profile data synced from the database.', 'success');
    if (typeof window.updateProfileUI === 'function') {
      window.updateProfileUI();
    }
  };

  const renderAuthRequired = () => {
    toggle(cardEl, false);
    toggle(emptyEl, true);
    setStatus('Sign in to see your profile.', 'warning');
    if (typeof window.updateProfileUI === 'function') {
      window.updateProfileUI();
    }
  };

  const fetchProfile = async () => {
    setStatus('Loading profile...', 'info');
    toggle(cardEl, false);
    toggle(emptyEl, false);

    try {
      const res = await fetch('api/index.php?r=auth/me', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((data.error && data.error.message) || `Request failed (${res.status})`);
      }

      if (!data || !data.authenticated || !data.user) {
        renderAuthRequired();
        return;
      }

      renderProfile(data.user);
    } catch (err) {
      toggle(cardEl, false);
      toggle(emptyEl, false);
      setStatus(err.message || 'Could not load profile. Please try again.', 'danger');
    }
  };

  document.addEventListener('DOMContentLoaded', fetchProfile);
})();
