(function () {
  var accounts = [
    { username: "user", password: "user123", role: "user" },
    { username: "admin", password: "admin123", role: "admin" },
    { username: "superadmin", password: "super123", role: "super admin" }
  ];

  var sessionKey = "yomiNaviAccount";
  var activeAccount = getStoredAccount();

  function getStoredAccount() {
    try {
      return JSON.parse(localStorage.getItem(sessionKey));
    } catch (error) {
      return null;
    }
  }

  function saveAccount(account) {
    activeAccount = { username: account.username, role: account.role };
    localStorage.setItem(sessionKey, JSON.stringify(activeAccount));
  }

  function openAccountHome(account) {
    if (account.role === "user") {
      window.location.href = "user.html";
      return;
    }

    if (account.role === "admin") {
      window.location.href = "admin.html";
      return;
    }

    if (account.role === "super admin") {
      window.location.href = "superadmin.html";
    }
  }

  function clearAccount() {
    activeAccount = null;
    localStorage.removeItem(sessionKey);
  }

  function createAuthModal() {
    var overlay = document.createElement("div");
    overlay.className = "auth-overlay";
    overlay.id = "auth-overlay";
    overlay.innerHTML =
      '<section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">' +
        '<button class="auth-close" type="button" aria-label="Close sign in">&times;</button>' +
        '<div class="auth-content"></div>' +
      '</section>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderLogin(overlay) {
    var content = overlay.querySelector(".auth-content");
    content.innerHTML =
      '<h2 class="auth-title" id="auth-title">Sign In</h2>' +
      '<p class="auth-copy">Choose a demo account or enter the credentials below.</p>' +
      '<form class="auth-form">' +
        '<label class="auth-field">' +
          '<span>Username</span>' +
          '<input name="username" type="text" autocomplete="username" required>' +
        '</label>' +
        '<label class="auth-field">' +
          '<span>Password</span>' +
          '<input name="password" type="password" autocomplete="current-password" required>' +
        '</label>' +
        '<button class="auth-submit" type="submit">Log In</button>' +
        '<p class="auth-message" role="status"></p>' +
      '</form>' +
      '<p class="demo-title">Demo accounts</p>' +
      '<div class="demo-list">' +
        accounts.map(function (account) {
          return '<button class="demo-account" type="button" data-user="' + account.username + '">' +
            '<strong>' + account.role + '</strong>' +
            '<span>' + account.username + ' / ' + account.password + '</span>' +
          '</button>';
        }).join("") +
      '</div>';

    content.querySelector(".auth-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      var username = form.elements.username.value.trim().toLowerCase();
      var password = form.elements.password.value;
      var account = accounts.find(function (item) {
        return item.username === username && item.password === password;
      });

      if (!account) {
        content.querySelector(".auth-message").textContent = "Invalid username or password.";
        return;
      }

      saveAccount(account);
      updateProfileButtons();
      openAccountHome(account);
      renderAccount(overlay);
    });

    content.querySelectorAll(".demo-account").forEach(function (button) {
      button.addEventListener("click", function () {
        var account = accounts.find(function (item) {
          return item.username === button.dataset.user;
        });
        saveAccount(account);
        updateProfileButtons();
        openAccountHome(account);
        renderAccount(overlay);
      });
    });
  }

  function renderAccount(overlay) {
    var content = overlay.querySelector(".auth-content");
    content.innerHTML =
      '<h2 class="auth-title" id="auth-title">Account</h2>' +
      '<div class="account-panel">' +
        '<div class="account-card">' +
          '<p class="account-name">' + activeAccount.username + '</p>' +
          '<p class="account-role">' + activeAccount.role + '</p>' +
        '</div>' +
        '<button class="logout-button" type="button">Log Out</button>' +
      '</div>';

    content.querySelector(".logout-button").addEventListener("click", function () {
      clearAccount();
      updateProfileButtons();
      renderLogin(overlay);
    });
  }

  function openAuth(overlay) {
    if (activeAccount) {
      renderAccount(overlay);
    } else {
      renderLogin(overlay);
    }

    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var firstField = overlay.querySelector(".auth-content input, .auth-content button");
    if (firstField) {
      firstField.focus();
    }
  }

  function closeAuth(overlay) {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function updateProfileButtons() {
    document.querySelectorAll(".profile-button").forEach(function (button) {
      button.setAttribute("aria-label", activeAccount ? "Open account" : "Open sign in");
      button.title = activeAccount ? activeAccount.role : "Sign in";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var overlay = createAuthModal();

    document.querySelectorAll(".profile-button").forEach(function (button) {
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", "auth-overlay");
      button.addEventListener("click", function () {
        openAuth(overlay);
      });
    });

    overlay.querySelector(".auth-close").addEventListener("click", function () {
      closeAuth(overlay);
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeAuth(overlay);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeAuth(overlay);
      }
    });

    updateProfileButtons();
  });
})();
