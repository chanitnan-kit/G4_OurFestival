document.addEventListener("DOMContentLoaded", () => {
  // Ensure Bootstrap JS (bundle) is loaded once for components like Modal/Dropdown
  const ensureBootstrap = (() => {
    let loading = false;
    return () => {
      if (window.bootstrap) return; // already available
      if (loading) return;
      loading = true;
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js";
      script.async = true;
      script.addEventListener("load", () => {
        // Signal to any listeners that Bootstrap APIs are ready
        try { window.dispatchEvent(new CustomEvent("bootstrap:ready")); } catch (_) {}
      }, { once: true });
      document.head.appendChild(script);
    };
  })();

  ensureBootstrap();
  const assetBase = (() => {
    const currentScript =
      document.currentScript ||
      Array.from(document.querySelectorAll("script")).find((script) =>
        (script.getAttribute("src") || "").includes("layout-loader.js")
      );

    if (!currentScript) {
      return window.location.href;
    }

    const scriptUrl = new URL(currentScript.getAttribute("src"), window.location.href);
    return new URL("..", scriptUrl).href;
  })();

  const resolveAssetPath = (relativePath) => new URL(relativePath, assetBase).href;
  const isAdminSummaryPage = () => {
    const p = (window.location.pathname || "").toLowerCase();
    return p.endsWith("/registration-summary.html") || p.endsWith("registration-summary.html") ||
           p.endsWith("/feedback-summary.html") || p.endsWith("feedback-summary.html");
  };
  const fixRelativeUrls = (root) => {
    const isRelative = (v) => v && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v) && !v.startsWith('/') && !v.startsWith('#');
    root.querySelectorAll('a[href], img[src]').forEach((el) => {
      const attr = el.tagName === 'A' ? 'href' : 'src';
      const val = el.getAttribute(attr);
      if (isRelative(val)) {
        el.setAttribute(attr, resolveAssetPath(val));
      }
    });
  };

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
      script.src = resolveAssetPath("js/UserProfile.js");
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
      script.src = resolveAssetPath("js/auth.js");
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

  const ensureAdminLoader = () => {
    if (!isAdminSummaryPage()) return;
    let script = document.querySelector('script[data-admin-script="true"]');
    if (!script) {
      script = document.createElement("script");
      script.src = resolveAssetPath("js/admin-loader.js");
      script.dataset.adminScript = "true";
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
      }, { once: true });
      document.body.appendChild(script);
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

  loadFragment(
    "#header-placeholder",
    resolveAssetPath("component/header.html"),
    (container) => { ensureAuth(container, () => ensureProfileDropdown(container)); fixRelativeUrls(container); }
  );
  loadFragment("#fireworks-placeholder", resolveAssetPath("component/fireworks.html"));
  loadFragment("#footer-placeholder", resolveAssetPath("component/footer.html"));
  // Load admin page logic only on admin summary pages
  ensureAdminLoader();
});
