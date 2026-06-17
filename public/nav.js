(function () {
  function parsePages(text) {
    return text
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line && line.charAt(0) !== "#";
      })
      .map(function (line) {
        var match = line.match(/^File name\s*=\s*"([^"]+)"\s+Title\s*=\s*"([^"]+)"$/i);
        if (!match) return null;

        return {
          fileName: match[1],
          title: match[2]
        };
      })
      .filter(Boolean);
  }

  function pageHref(fileName) {
    return fileName === "index.html" ? "/" : "/" + fileName.replace(/^\/+/, "");
  }

  function currentFileName() {
    var path = window.location.pathname.replace(/^\/+/, "");
    return path === "" ? "index.html" : path;
  }

  function shouldUseSecondaryStyle(fileName) {
    return fileName !== "index.html" && fileName !== "shutdown.html";
  }

  function renderNavigation(pages) {
    var navs = document.querySelectorAll("[data-pages-nav]");
    var current = currentFileName();

    navs.forEach(function (nav) {
      var themeButton = nav.querySelector("[data-theme-toggle], #themeToggle");

      nav.querySelectorAll("a").forEach(function (link) {
        link.remove();
      });

      pages.forEach(function (page) {
        var link = document.createElement("a");
        var classes = [];

        link.href = pageHref(page.fileName);
        link.textContent = page.title;

        if (shouldUseSecondaryStyle(page.fileName)) classes.push("secondary");
        if (page.fileName === current) classes.push("active");
        if (classes.length) link.className = classes.join(" ");

        nav.insertBefore(link, themeButton || null);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("/Pages.txt", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Could not load Pages.txt");
        return response.text();
      })
      .then(function (text) {
        var pages = parsePages(text);
        if (pages.length) renderNavigation(pages);
      })
      .catch(function () {
        // Keep the hardcoded fallback navigation if Pages.txt cannot load.
      });
  });
})();
