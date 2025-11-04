document.addEventListener("DOMContentLoaded", () => {
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
});


