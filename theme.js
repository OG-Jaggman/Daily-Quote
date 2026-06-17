(function () {
  function getSavedTheme() {
    return localStorage.getItem("dailyQuoteTheme") || "light";
  }

  function setButtonText(theme) {
    var buttons = document.querySelectorAll("[data-theme-toggle], #themeToggle");

    buttons.forEach(function (button) {
      button.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
      button.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
      if (document.body) document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
      if (document.body) document.body.classList.remove("dark-mode");
    }

    setButtonText(theme);
  }

  window.toggleTheme = function () {
    var currentTheme = document.documentElement.classList.contains("dark-mode") ? "dark" : "light";
    var nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem("dailyQuoteTheme", nextTheme);
    applyTheme(nextTheme);
  };

  window.loadSavedTheme = function () {
    applyTheme(getSavedTheme());
  };

  applyTheme(getSavedTheme());

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getSavedTheme());

    document.querySelectorAll("[data-theme-toggle], #themeToggle").forEach(function (button) {
      button.onclick = window.toggleTheme;
    });
  });
})();
