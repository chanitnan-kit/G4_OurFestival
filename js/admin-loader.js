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

  const renderJSONBlock = (container, data) => {
    const pre = el('pre', 'bg-light p-3 rounded border');
    pre.textContent = JSON.stringify(data, null, 2);
    container.appendChild(pre);
  };

  const run = async () => {
    const kind = pageKind();
    if (!kind) return; // not an admin summary page
    const main = findMain();

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
        const h = el('h3', 'mb-3', 'Registration Summary');
        main.appendChild(h);

        const info = el('div', 'mb-3 text-muted');
        info.textContent = `Total users (excluding admins): ${data.total ?? 0}`;
        main.appendChild(info);

        const table = el('table', 'table table-sm table-striped');
        const thead = document.createElement('thead');
        const trh = document.createElement('tr');
        ['ID','Full Name','Username','Email','Gender','DOB','Phone','Address','Created At'].forEach((t)=>{
          const th = document.createElement('th'); th.textContent = t; trh.appendChild(th);
        });
        thead.appendChild(trh);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        (data.users || []).forEach(u => {
          const tr = document.createElement('tr');
          const dob = [u.birth_day,u.birth_month,u.birth_year].every(v=>v!=null) ? `${u.birth_day||''}/${u.birth_month||''}/${u.birth_year||''}` : '';
          [u.id, u.name||'', u.username||'', u.email||'', u.gender||'', dob, u.phone_number||'', u.address||'', (u.created_at||'').replace('T',' ')].forEach(val=>{
            const td = document.createElement('td'); td.textContent = String(val ?? ''); tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        main.appendChild(table);
      } else if (kind === 'feedback') {
        const data = await fetchJSON('api/summary/feedback.php');
        const h = el('h3', 'mb-3', 'Feedback Summary');
        main.appendChild(h);
        renderJSONBlock(main, data);
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
