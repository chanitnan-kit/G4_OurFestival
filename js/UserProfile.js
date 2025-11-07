(() => {
  const DROPDOWN_SELECTOR = ".profile-dropdown";
  const MENU_SELECTOR = ".dropdown-menu";
  const TOGGLE_SELECTOR = ".profile-avatar-link";
  const LOGOUT_SELECTOR = "[data-action='logout']";
  const REQUIRES_AUTH_SELECTOR = "[data-requires-auth='true']";
  const OPEN_CLASS = "show";

  const resetMenuPosition = (menu) => {
    if (!menu) return;
    menu.style.removeProperty("top");
    menu.style.removeProperty("right");
    menu.style.removeProperty("left");
    menu.style.removeProperty("width");
  };

  const closeDropdown = (dropdown) => {
    if (!dropdown) return;
    const menu = dropdown.querySelector(MENU_SELECTOR);
    const toggle = dropdown.querySelector(TOGGLE_SELECTOR);

    dropdown.classList.remove(OPEN_CLASS);
    if (menu) {
      menu.classList.remove(OPEN_CLASS);
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }

    resetMenuPosition(menu);
  };

  const closeAllDropdowns = (exclude) => {
    document.querySelectorAll(`${DROPDOWN_SELECTOR}[data-profile-init="true"]`).forEach((dropdown) => {
      if (dropdown !== exclude) {
        closeDropdown(dropdown);
      }
    });
  };

  const bindGlobalListeners = (() => {
    let bound = false;
    return () => {
      if (bound) return;
      document.addEventListener("click", (event) => {
        const dropdown = event.target.closest(DROPDOWN_SELECTOR);
        if (!dropdown) {
          closeAllDropdowns();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeAllDropdowns();
        }
      });

      window.addEventListener("resize", () => closeAllDropdowns());
      window.addEventListener("scroll", () => closeAllDropdowns(), { passive: true });

      bound = true;
    };
  })();

  const setupDropdown = (dropdown) => {
    if (!dropdown || dropdown.dataset.profileInit === "true") return;

    const toggle = dropdown.querySelector(TOGGLE_SELECTOR);
    const menu = dropdown.querySelector(MENU_SELECTOR);
    if (!toggle || !menu) return;
    // Prevent Bootstrap's data API from binding dropdown behavior
    if (toggle.hasAttribute('data-bs-toggle')) {
      toggle.removeAttribute('data-bs-toggle');
    }

    const open = () => {
      closeAllDropdowns(dropdown);
      dropdown.classList.add(OPEN_CLASS);
      menu.classList.add(OPEN_CLASS);
      toggle.setAttribute("aria-expanded", "true");
      // Ensure visibility even if Bootstrap CSS isn't present
      menu.style.display = "block";

       const rect = toggle.getBoundingClientRect();
      const gutter = 12;
      const availableRight = window.innerWidth - rect.right;
      const right = Math.max(availableRight, gutter);
      const minWidth = 160;
      const maxAllowed = 200;
      const availableWidth = Math.max(window.innerWidth - gutter * 2, minWidth);
      const width = Math.min(maxAllowed, availableWidth);

      menu.style.top = `${rect.bottom + gutter}px`;
      menu.style.right = `${right}px`;
      menu.style.left = "auto";
      menu.style.width = `${width}px`;
    };

    const close = () => {
      closeDropdown(dropdown);
      if (menu) {
        menu.style.removeProperty("display");
      }
    };

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      // Stop Bootstrap or any other handlers from also toggling
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
      event.stopPropagation();

      if (menu.classList.contains(OPEN_CLASS)) {
        close();
      } else {
        open();
      }
    });

    menu.addEventListener("click", (event) => {
      // Prevent outer handlers from interfering while interacting inside the menu
      event.stopPropagation();
      const logoutButton = event.target.closest(LOGOUT_SELECTOR);
      if (logoutButton) {
        event.preventDefault();
        if (typeof window.isUserRegistered === "function" && window.isUserRegistered()) {
          if (typeof window.logoutUser === "function") {
            window.logoutUser();
          }
        } else {
          window.location.href = "registration.html";
        }
        close();
        return;
      }

      const requiresAuthTarget = event.target.closest(REQUIRES_AUTH_SELECTOR);
      if (requiresAuthTarget) {
        if (!(typeof window.isUserRegistered === "function" && window.isUserRegistered())) {
          event.preventDefault();
          window.location.href = "registration.html";
          close();
          return;
        }
      }

      if (event.target.closest("a, button")) {
        close();
      }
    });

    dropdown.dataset.profileInit = "true";
  };

  window.initProfileDropdowns = (root = document) => {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll(DROPDOWN_SELECTOR).forEach(setupDropdown);
    bindGlobalListeners();
  };

  window.closeProfileDropdowns = () => closeAllDropdowns();
})();
