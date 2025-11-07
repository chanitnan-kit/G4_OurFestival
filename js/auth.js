(() => {
  const REGISTERED_KEY = "is_registered";
  const NAME_KEY = "register_name";
  const ROLE_KEY = "user_role"; // 'admin' | 'user' | undefined

  const isUserRegistered = () => localStorage.getItem(REGISTERED_KEY) === "true";

  const getUsername = () => {
    const stored = localStorage.getItem(NAME_KEY);
    if (!stored) {
      return "Guest";
    }
    const trimmed = stored.trim();
    return trimmed.length > 0 ? trimmed : "Guest";
  };

  const getUserRole = () => {
    const role = localStorage.getItem(ROLE_KEY);
    if (role === "admin" || role === "user") return role;
    return "guest";
  };

  const isAdmin = () => getUserRole() === "admin";

  const toggleAuthVisibility = (root, isRegistered) => {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll("[data-auth-show]").forEach((el) => {
      const state = el.getAttribute("data-auth-show");
      const shouldShow = state === "logged-in" ? isRegistered : !isRegistered;
      el.classList.toggle("d-none", !shouldShow);
    });

    // Role-based visibility (admin-only etc.)
    scope.querySelectorAll("[data-auth-role]").forEach((el) => {
      const required = (el.getAttribute("data-auth-role") || "").trim();
      const role = getUserRole();
      let show = false;
      if (isRegistered) {
        if (required === "admin") show = role === "admin";
        else if (required === "user") show = role === "user" || role === "admin"; // admin inherits user
      }
      el.classList.toggle("d-none", !show);
    });
  };

  const updateProfileUI = (root = document) => {
    const scope = root instanceof Element ? root : document;
    const registered = isUserRegistered();
    const username = getUsername();

    scope.querySelectorAll("[data-profile-name]").forEach((el) => {
      el.textContent = username;
    });

    toggleAuthVisibility(scope, registered);
  };

  const logoutUser = async () => {
    try {
      await fetch('api/index.php?r=auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) { /* ignore network errors */ }
    localStorage.setItem(REGISTERED_KEY, "false");
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(ROLE_KEY);
    updateProfileUI();
    if (typeof window.closeProfileDropdowns === "function") {
      window.closeProfileDropdowns();
    }
  };

  window.isUserRegistered = isUserRegistered;
  window.getUsername = getUsername;
  window.getUserRole = getUserRole;
  window.isAdmin = isAdmin;
  window.updateProfileUI = updateProfileUI;
  window.logoutUser = logoutUser;

  const syncAuthFromServer = async () => {
    try {
      const res = await fetch('api/index.php?r=auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error('me failed');
      const data = await res.json();
      if (data && data.authenticated && data.user) {
        localStorage.setItem(REGISTERED_KEY, 'true');
        localStorage.setItem(NAME_KEY, data.user.name || data.user.username || '');
        localStorage.setItem(ROLE_KEY, data.user.role || 'user');
      } else {
        localStorage.setItem(REGISTERED_KEY, 'false');
        localStorage.removeItem(NAME_KEY);
        localStorage.removeItem(ROLE_KEY);
      }
    } catch (_) {
      // keep existing local state on network error
    } finally {
      updateProfileUI();
    }
  };

  document.addEventListener("DOMContentLoaded", () => syncAuthFromServer());
})();
