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

  function normalizeFileName(fileName) {
    return fileName.replace(/^\/+/, "");
  }

  function pageHref(fileName) {
    fileName = normalizeFileName(fileName);
    return fileName === "index.html" ? "/" : "/" + fileName;
  }

  function currentFileName() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var fileName = path.split("/").pop() || "index.html";

    return decodeURIComponent(fileName) || "index.html";
  }

  function linkFileName(link) {
    var pathname = new URL(link.getAttribute("href"), window.location.href).pathname.replace(/\/+$/, "");
    var fileName = pathname.split("/").pop() || "index.html";

    return decodeURIComponent(fileName) || "index.html";
  }

  function markCurrentNavigation() {
    var current = currentFileName();

    document.querySelectorAll("[data-pages-nav]").forEach(function (nav) {
      nav.querySelectorAll("a").forEach(function (link) {
        var isCurrent = linkFileName(link) === current;

        link.classList.toggle("active", isCurrent);

        if (isCurrent) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
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

        var normalizedFileName = normalizeFileName(page.fileName);

        link.href = pageHref(normalizedFileName);
        link.textContent = page.title;

        if (shouldUseSecondaryStyle(normalizedFileName)) classes.push("secondary");
        if (normalizedFileName === current) {
          classes.push("active");
          link.setAttribute("aria-current", "page");
        }
        if (classes.length) link.className = classes.join(" ");

        nav.insertBefore(link, themeButton || null);
      });

      markCurrentNavigation();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    markCurrentNavigation();

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
        markCurrentNavigation();
      });
  });
})();
