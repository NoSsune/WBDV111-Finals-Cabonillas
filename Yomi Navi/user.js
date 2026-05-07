(function () {
  var sessionKey = "yomiNaviAccount";

  function getStoredAccount() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey));
    } catch (error) {
      return null;
    }
  }

  function getRoleHome(role) {
    if (role === "admin") {
      return "admin.html";
    }

    if (role === "super admin") {
      return "superadmin.html";
    }

    return "user.html";
  }

  function guardPageAccess() {
    var account = getStoredAccount();
    var body = document.body;
    var allowedRoles = ["user"];

    if (body.classList.contains("admin-page")) {
      allowedRoles = ["admin", "super admin"];
    } else if (body.classList.contains("superadmin-page")) {
      allowedRoles = ["super admin"];
    }

    if (!account) {
      window.location.href = "index.html";
      return false;
    }

    if (allowedRoles.indexOf(account.role) === -1) {
      window.location.href = getRoleHome(account.role);
      return false;
    }

    return true;
  }

  function closeMenus() {
    document.querySelectorAll(".account-menu").forEach(function (menu) {
      menu.classList.remove("is-open");
    });

    document.querySelectorAll(".user-avatar-button").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
    });
  }

  function closeGenreFilter() {
    var filter = document.querySelector(".genre-filter");
    var button = document.querySelector(".nav-filter-button");

    if (filter) {
      filter.classList.remove("is-open");
    }

    if (button) {
      button.classList.remove("is-active");
      button.setAttribute("aria-expanded", "false");
    }
  }

  function setupMangaTools() {
    var searchInput = document.querySelector("#manga-search");
    var status = document.querySelector(".search-status");
    var filterButton = document.querySelector(".nav-filter-button");
    var genreFilter = document.querySelector(".genre-filter");
    var mangaCards = Array.prototype.slice.call(document.querySelectorAll(".searchable-manga"));
    var selectedGenre = "all";

    function normalize(value) {
      return value.toLowerCase().trim();
    }

    function applyFilters() {
      var query = searchInput ? normalize(searchInput.value) : "";
      var visibleCount = 0;

      mangaCards.forEach(function (card) {
        var title = normalize(card.dataset.title || "");
        var genres = normalize(card.dataset.genres || "");
        var matchesSearch = !query || title.indexOf(query) !== -1;
        var matchesGenre = selectedGenre === "all" || genres.indexOf(selectedGenre) !== -1;
        var isVisible = matchesSearch && matchesGenre;

        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (!status) {
        return;
      }

      if (!query && selectedGenre === "all") {
        status.textContent = "";
      } else if (visibleCount === 0) {
        status.textContent = "No manga found.";
      } else {
        status.textContent = visibleCount + " manga found.";
      }
    }

    if (searchInput) {
      searchInput.form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
      searchInput.addEventListener("input", applyFilters);
    }

    if (filterButton && genreFilter) {
      filterButton.addEventListener("click", function (event) {
        event.stopPropagation();
        var shouldOpen = !genreFilter.classList.contains("is-open");
        closeMenus();
        genreFilter.classList.toggle("is-open", shouldOpen);
        filterButton.classList.toggle("is-active", shouldOpen);
        filterButton.setAttribute("aria-expanded", String(shouldOpen));
      });

      genreFilter.addEventListener("click", function (event) {
        event.stopPropagation();

        if (!event.target.matches("button[data-genre]")) {
          return;
        }

        selectedGenre = event.target.dataset.genre;
        genreFilter.querySelectorAll("button").forEach(function (button) {
          button.classList.toggle("is-selected", button === event.target);
        });
        applyFilters();
        closeGenreFilter();
        document.querySelector("#available").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!guardPageAccess()) {
      return;
    }

    document.querySelectorAll(".user-account").forEach(function (account) {
      var button = account.querySelector(".user-avatar-button");
      var menu = account.querySelector(".account-menu");
      var logout = account.querySelector(".logout-button");

      button.addEventListener("click", function (event) {
        event.stopPropagation();
        var shouldOpen = !menu.classList.contains("is-open");
        closeGenreFilter();
        closeMenus();
        menu.classList.toggle("is-open", shouldOpen);
        button.setAttribute("aria-expanded", String(shouldOpen));
      });

      menu.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      logout.addEventListener("click", function () {
        localStorage.removeItem(sessionKey);
        window.location.href = "index.html";
      });
    });

    setupMangaTools();

    document.addEventListener("click", function () {
      closeMenus();
      closeGenreFilter();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenus();
        closeGenreFilter();
      }
    });
  });
})();
