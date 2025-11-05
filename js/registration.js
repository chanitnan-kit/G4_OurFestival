(() => {
  const REGISTERED_KEY = 'is_registered';
  const NAME_KEY = 'register_name';
  const ROLE_KEY = 'user_role';

  const byId = (id) => document.getElementById(id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = (byId('name').value || '').trim();
    const username = (byId('username').value || '').trim();
    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : '';
    const day = (byId('dob-day').value || '').trim();
    const month = (byId('dob-month').value || '').trim();
    const year = (byId('dob-year').value || '').trim();
    const phone = (byId('phone_num').value || '').trim();
    const address = (byId('address').value || '').trim();
    const email = (byId('email').value || '').trim();
    const password = byId('password').value || '';
    const confirm = byId('confirm-password').value || '';

    if (!name) {
      alert('Please enter your name.');
      byId('name').focus();
      return;
    }
    if (!username) {
      alert('Please choose a username.');
      byId('username').focus();
      return;
    }
    if (!gender) {
      alert('Please select your gender.');
      return;
    }
    const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
    if (!Number.isInteger(d) || d < 1 || d > 31) {
      alert('Please enter a valid day (1-31).');
      byId('dob-day').focus();
      return;
    }
    if (!Number.isInteger(m) || m < 1 || m > 12) {
      alert('Please enter a valid month (1-12).');
      byId('dob-month').focus();
      return;
    }
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(y) || y < 1900 || y > currentYear) {
      alert(`Please enter a valid year (1900-${currentYear}).`);
      byId('dob-year').focus();
      return;
    }
    if (!phone) {
      alert('Please enter your phone number.');
      byId('phone_num').focus();
      return;
    }
    if (!address) {
      alert('Please enter your address.');
      byId('address').focus();
      return;
    }
    if (!email) {
      alert('Please enter your email.');
      byId('email').focus();
      return;
    }
    if (!password) {
      alert('Please enter a password.');
      byId('password').focus();
      return;
    }
    if (password !== confirm) {
      alert('Passwords do not match.');
      byId('confirm-password').focus();
      return;
    }

    try {
      const res = await fetch('api/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, username, gender, birth_day: d, birth_month: m, birth_year: y, phone_number: phone, address, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error?.message || `Registration failed (HTTP ${res.status})`;
        alert(msg);
        return;
      }
      const user = data.user || {};
      localStorage.setItem(REGISTERED_KEY, 'true');
      localStorage.setItem(NAME_KEY, user.name || '');
      localStorage.setItem(ROLE_KEY, user.role || 'user');
      if (typeof window.updateProfileUI === 'function') window.updateProfileUI();
      alert('Registration complete.');
      window.location.href = 'index.html';
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    if (form) form.addEventListener('submit', handleSubmit);
  });
})();
