document.addEventListener("DOMContentLoaded", () => {
  const loadFragment = (selector, filePath) => {
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
      })
      .catch((error) => {
        console.error(error);
      });
  };

  loadFragment("#header-placeholder", "component/header.html");
  loadFragment("#fireworks-placeholder", "component/fireworks.html");
  loadFragment("#footer-placeholder", "component/footer.html");
});
