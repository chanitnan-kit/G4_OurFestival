(() => {
  const REGISTERED_KEY = "is_registered";
  const NAME_KEY = "register_name";

  const isUserRegistered = () => localStorage.getItem(REGISTERED_KEY) === "true";

  const getUsername = () => {
    const stored = localStorage.getItem(NAME_KEY);
    if (!stored) {
      return "Guest";
    }
    const trimmed = stored.trim();
    return trimmed.length > 0 ? trimmed : "Guest";
  };

  const toggleAuthVisibility = (root, isRegistered) => {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll("[data-auth-show]").forEach((el) => {
      const state = el.getAttribute("data-auth-show");
      const shouldShow = state === "logged-in" ? isRegistered : !isRegistered;
      el.classList.toggle("d-none", !shouldShow);
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

  const logoutUser = () => {
    localStorage.setItem(REGISTERED_KEY, "false");
    localStorage.removeItem(NAME_KEY);
    updateProfileUI();
    if (typeof window.closeProfileDropdowns === "function") {
      window.closeProfileDropdowns();
    }
  };

  window.isUserRegistered = isUserRegistered;
  window.getUsername = getUsername;
  window.updateProfileUI = updateProfileUI;
  window.logoutUser = logoutUser;

  document.addEventListener("DOMContentLoaded", () => updateProfileUI());
})();
