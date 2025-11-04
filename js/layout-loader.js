document.addEventListener("DOMContentLoaded", () => {
  const ensureProfileDropdown = (rootElement, next) => {
    const initialize = () => {
      if (typeof window.initProfileDropdowns === "function") {
        window.initProfileDropdowns(rootElement);
      }
      if (typeof next === "function") {
        next();
      }
    };

    if (typeof window.initProfileDropdowns === "function") {
      initialize();
      return;
    }

    let script = document.querySelector('script[data-profile-script="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "js/UserProfile.js";
      script.dataset.profileScript = "true";
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          initialize();
        },
        { once: true }
      );
      document.body.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      initialize();
    } else {
      script.addEventListener("load", initialize, { once: true });
    }
  };

  const ensureAuth = (rootElement, next) => {
    const initialize = () => {
      if (typeof window.updateProfileUI === "function") {
        window.updateProfileUI(rootElement);
      }
      if (typeof next === "function") {
        next();
      }
    };

    if (typeof window.updateProfileUI === "function") {
      initialize();
      return;
    }

    let script = document.querySelector('script[data-auth-script="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "js/auth.js";
      script.dataset.authScript = "true";
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          initialize();
        },
        { once: true }
      );
      document.body.appendChild(script);
    } else if (script.dataset.loaded === "true") {
      initialize();
    } else {
      script.addEventListener("load", initialize, { once: true });
    }
  };

  const loadFragment = (selector, filePath, callback) => {
    const container = document.querySelector(selector);
    if (!container) {
      return;
    }

    fetch(filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        container.innerHTML = html;
        if (typeof callback === "function") {
          callback(container);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  loadFragment("#header-placeholder", "component/header.html", (container) =>
    ensureAuth(container, () => ensureProfileDropdown(container))
  );
  loadFragment("#fireworks-placeholder", "component/fireworks.html");
  loadFragment("#footer-placeholder", "component/footer.html");
});
