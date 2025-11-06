(() => {
  const findMain = () => document.querySelector("main") || document.body;
  const pageKind = () => {
    const p = (window.location.pathname || "").toLowerCase();
    if (p.includes("registration-summary.html")) return "registration";
    if (p.includes("feedback-summary.html")) return "feedback";
    return null;
  };

  const el = (tag, cls, text) => {
    const x = document.createElement(tag);
    if (cls) x.className = cls;
    if (text) x.textContent = text;
    return x;
  };

  const renderMessage = (container, kind, title, message) => {
    const wrap = el("div", `alert alert-${kind}`);
    if (title) {
      const strong = el("strong", null, title + " ");
      wrap.appendChild(strong);
    }
    if (message) wrap.appendChild(document.createTextNode(message));
    container.prepend(wrap);
  };

  const fetchJSON = async (url, opts = {}) => {
    const res = await fetch(url, { credentials: 'include', headers: { 'Accept': 'application/json' }, ...opts });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return {};
    return res.json();
  };

  const clearMain = (main) => {
    if (!main) return;
    main.innerHTML = '';
    main.classList.add('admin-summary');
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    const iso = value.includes('T') ? value : value.replace(' ', 'T');
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  };

  const createStatCard = (title, value, subtitle) => {
    const card = el('div', 'col-sm-6 col-lg-3');
    const inner = el('div', 'border rounded-3 p-3 h-100 bg-light shadow-sm');
    const h = el('h6', 'text-uppercase text-muted mb-1', title);
    const strong = el('p', 'fs-4 fw-semibold mb-1', String(value));
    inner.appendChild(h);
    inner.appendChild(strong);
    if (subtitle) {
      const sub = el('div', 'text-muted small', subtitle);
      inner.appendChild(sub);
    }
    card.appendChild(inner);
    return card;
  };

  const renderTable = (headers, rows) => {
    const wrapper = el('div', 'table-responsive');
    const table = el('table', 'table table-hover align-middle');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headers.forEach((label) => {
      const th = document.createElement('th');
      th.textContent = label;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    rows.forEach((cells) => {
      const tr = document.createElement('tr');
      cells.forEach((cell) => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    wrapper.appendChild(table);
    return wrapper;
  };

  const renderEmptyState = (container, message) => {
    const box = el('div', 'text-center text-muted border rounded-3 py-5');
    box.textContent = message;
    container.appendChild(box);
  };

  const run = async () => {
    const kind = pageKind();
    if (!kind) return; // not an admin summary page
    const main = findMain();
    clearMain(main);

    // 1) Check auth/role via API
    let me;
    try {
      me = await fetchJSON('api/auth/me.php');
    } catch (e) {
      renderMessage(main, 'warning', 'API unavailable.', 'Cannot reach /api/auth/me. Set up backend first.');
      return;
    }

    const isAdmin = !!(me && me.authenticated && me.user && me.user.role === 'admin');
    if (!isAdmin) {
      renderMessage(main, 'danger', 'Unauthorized.', 'You must be an admin to view this page.');
      return;
    }

    // 2) Fetch summary according to page
    try {
      if (kind === 'registration') {
        const data = await fetchJSON('api/summary/registrations.php');
        const title = el('div', 'd-flex justify-content-between align-items-center mb-4');
        const h = el('h3', 'mb-0', 'Registration Summary');
        const sub = el('div', 'text-muted', `Last updated: ${formatDateTime(new Date().toISOString())}`);
        title.appendChild(h);
        title.appendChild(sub);
        main.appendChild(title);

        const users = Array.isArray(data.users) ? data.users : [];
        const total = data.total ?? users.length;
        const genderCounts = users.reduce((acc, user) => {
          const g = user.gender || 'Unspecified';
          acc[g] = (acc[g] || 0) + 1;
          return acc;
        }, {});
        const cardsRow = el('div', 'row g-3 mb-4');
        cardsRow.appendChild(createStatCard('Total Registrations', total));
        cardsRow.appendChild(createStatCard('Male', genderCounts['Male'] || 0));
        cardsRow.appendChild(createStatCard('Female', genderCounts['Female'] || 0));
        cardsRow.appendChild(createStatCard('Other / Unspecified', total - ((genderCounts['Male'] || 0) + (genderCounts['Female'] || 0))));
        main.appendChild(cardsRow);

        if (users.length === 0) {
          renderEmptyState(main, 'No registrations found yet.');
        } else {
          const rows = users.map((u) => {
            const dob = [u.birth_day, u.birth_month, u.birth_year].every((v) => v != null)
              ? `${u.birth_day || ''}/${u.birth_month || ''}/${u.birth_year || ''}`
              : '';
            const created = formatDateTime(u.created_at || '');
            return [
              String(u.id ?? ''),
              u.name || '',
              u.username || '',
              u.email || '',
              u.gender || '',
              dob,
              u.phone_number || '',
              u.address || '',
              created,
            ];
          });
          main.appendChild(renderTable(
            ['ID','Full Name','Username','Email','Gender','DOB','Phone','Address','Created At'],
            rows
          ));
        }
      } else if (kind === 'feedback') {
        const data = await fetchJSON('api/summary/feedback.php');
        const title = el('div', 'd-flex justify-content-between align-items-center mb-4');
        const h = el('h3', 'mb-0', 'Feedback Summary');
        const sub = el('div', 'text-muted', `Last updated: ${formatDateTime(new Date().toISOString())}`);
        title.appendChild(h);
        title.appendChild(sub);
        main.appendChild(title);

        const total = data.total ?? 0;
        const avg = data.average_rating ?? 0;
        const positive = (data.counts?.['4'] || 0) + (data.counts?.['5'] || 0);
        const neutral = data.counts?.['3'] || 0;
        const negative = (data.counts?.['1'] || 0) + (data.counts?.['2'] || 0);
        const cardsRow = el('div', 'row g-3 mb-4');
        cardsRow.appendChild(createStatCard('Total Feedback', total));
        cardsRow.appendChild(createStatCard('Average Rating', avg, '/ 5.0'));
        cardsRow.appendChild(createStatCard('Positive (4-5)', positive));
        cardsRow.appendChild(createStatCard('Negative (1-2)', negative, `Neutral: ${neutral}`));
        main.appendChild(cardsRow);

        if (data.counts) {
          const countsWrap = el('div', 'mb-4');
          countsWrap.appendChild(el('h5', 'mb-2', 'Counts by Rating'));
          const rows = [1,2,3,4,5].map((r) => [String(r), String(data.counts?.[r] ?? data.counts?.[String(r)] ?? 0)]);
          countsWrap.appendChild(renderTable(['Rating','Count'], rows));
          main.appendChild(countsWrap);
        }

        if (Array.isArray(data.recent) && data.recent.length) {
          const recentWrap = el('div', 'mb-3');
          recentWrap.appendChild(el('h5', 'mb-2', 'Recent Feedback'));
          const rows = data.recent.map((fb) => [
            String(fb.id ?? ''),
            String(fb.rating ?? ''),
            fb.comment || '',
            fb.username || '',
            fb.name || '',
            formatDateTime(fb.created_at || ''),
          ]);
          recentWrap.appendChild(renderTable(['ID','Rating','Comment','Username','Name','Created At'], rows));
          main.appendChild(recentWrap);
        } else {
          renderEmptyState(main, 'No feedback submitted yet.');
        }
      }
    } catch (e) {
      const msg = e && e.status === 403
        ? 'Your account is not authorized to access this summary.'
        : 'Failed to load summary. Ensure API endpoints are implemented.';
      renderMessage(main, 'warning', 'Load failed.', msg);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
