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

  function pageIdFromPath(path) {
    var cleanPath = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
    var fileName = cleanPath.split("/").pop() || "index.html";

    fileName = decodeURIComponent(fileName);
    fileName = fileName.replace(/\.html$/i, "");

    return fileName === "index" ? "home" : fileName;
  }

  function pageIdFromFileName(fileName) {
    return pageIdFromPath(normalizeFileName(fileName));
  }

  function pageHref(fileName) {
    fileName = normalizeFileName(fileName);
    return sitePrefix() + (fileName === "index.html" ? "" : fileName);
  }

  function sitePrefix() {
    var path = window.location.pathname;
    var publicIndex = path.toLowerCase().indexOf("/public/");

    return publicIndex === -1 ? "/" : path.slice(0, publicIndex + 8);
  }

  function fetchPagesFile() {
    return fetch("/Pages.txt", { cache: "no-store" })
      .then(function (response) {
        if (response.ok) return response;
        return fetch("Pages.txt", { cache: "no-store" });
      })
      .catch(function () {
        return fetch("Pages.txt", { cache: "no-store" });
      });
  }

  function currentFileName() {
    var path = window.location.pathname.replace(/\/+$/, "");
    var fileName = path.split("/").pop() || "index.html";

    return decodeURIComponent(fileName) || "index.html";
  }

  function currentPageId() {
    return pageIdFromPath(window.location.pathname);
  }

  function linkPageId(link) {
    var pathname = new URL(link.getAttribute("href"), window.location.href).pathname.replace(/\/+$/, "");
    return pageIdFromPath(pathname);
  }

  function markCurrentNavigation() {
    var current = currentPageId();

    document.querySelectorAll("[data-pages-nav]").forEach(function (nav) {
      nav.querySelectorAll("a").forEach(function (link) {
        var isCurrent = linkPageId(link) === current;

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
    var current = currentPageId();

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
        if (pageIdFromFileName(normalizedFileName) === current) {
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

    fetchPagesFile()
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
