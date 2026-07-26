/* ============================================
   MAIN APPLICATION ROUTER & LAYOUT CONTROLLER
   ============================================ */

const App = {
  currentView: "dashboard",
  selectedIndustryFilter: null,
  selectedRole: "admin",

  init: async () => {
    // Load database state from Express API
    await DataService.init();

    const user = AuthService.getCurrentUser();
    if (!user) {
      App.renderLoginScreen();
    } else {
      App.renderAppLayout(user);
    }
  },

  // ===== Render Login Screen =====
  renderLoginScreen: () => {
    const root = document.getElementById("app-root");

    root.innerHTML = `
      <div class="login-screen">
        <div class="login-bg">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
        </div>

        <div class="login-card">
          <div class="login-logo">
            <div class="logo-icon">
              <img src="assets/logo.png" alt="Shree Pratham Logo" />
            </div>
            <h1>Shree Pratham</h1>
            <p>Industrial CEMS & Telemetry Dashboard</p>
          </div>

          <div class="login-section-header">
            <div class="login-section-title">Select Login Section</div>
            <div class="role-selector" id="login-role-selector">
              <button type="button" class="role-btn ${App.selectedRole === 'admin' ? 'active' : ''}" data-role="admin">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Admin</span>
              </button>
              <button type="button" class="role-btn ${App.selectedRole === 'industry' ? 'active' : ''}" data-role="industry">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                <span>Industry</span>
              </button>
              <button type="button" class="role-btn ${App.selectedRole === 'engineer' ? 'active' : ''}" data-role="engineer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                <span>Engineer</span>
              </button>
            </div>
          </div>

          <div class="login-error" id="login-error-msg"></div>

          <form class="login-form" id="login-form">
            <div class="form-group">
              <label>Username</label>
              <div class="input-wrapper">
                <input type="text" id="login-username" placeholder="Enter username" value="${App.selectedRole === 'admin' ? 'admin' : (App.selectedRole === 'engineer' ? 'engineer' : 'apex_steel')}" required />
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <input type="password" id="login-password" placeholder="••••••••" value="${App.selectedRole === 'admin' ? 'admin123' : (App.selectedRole === 'engineer' ? 'eng123' : 'pass123')}" required />
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
            </div>

            <button type="submit" class="login-btn" id="login-submit-btn">
              Sign In to Dashboard
            </button>
          </form>

          <div class="login-demo">
            <p>Demo Credentials by Section:</p>
            <div class="credentials">
              <span class="cred-tag" data-role="admin" data-user="admin" data-pass="admin123">🔑 Admin</span>
              <span class="cred-tag" data-role="industry" data-user="apex_steel" data-pass="pass123">🏭 Apex Steel</span>
              <span class="cred-tag" data-role="industry" data-user="titan_cement" data-pass="pass123">🏗️ Titan Cement</span>
              <span class="cred-tag" data-role="engineer" data-user="engineer" data-pass="eng123">👷 Engineer</span>
            </div>
          </div>
        </div>
      </div>
    `;

    App.attachLoginListeners();
  },

  attachLoginListeners: () => {
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");
    const form = document.getElementById("login-form");
    const errorMsg = document.getElementById("login-error-msg");
    const roleBtns = document.querySelectorAll("#login-role-selector .role-btn");

    // Section Role Selector Tabs
    roleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        roleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        App.selectedRole = btn.getAttribute("data-role");

        if (App.selectedRole === "admin") {
          usernameInput.value = "admin";
          passwordInput.value = "admin123";
        } else if (App.selectedRole === "engineer") {
          usernameInput.value = "engineer";
          passwordInput.value = "eng123";
        } else if (App.selectedRole === "industry") {
          usernameInput.value = "apex_steel";
          passwordInput.value = "pass123";
        }
      });
    });

    // Demo credential chips
    document.querySelectorAll(".cred-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const role = tag.getAttribute("data-role");
        if (role) {
          App.selectedRole = role;
          roleBtns.forEach(b => {
            if (b.getAttribute("data-role") === role) b.classList.add("active");
            else b.classList.remove("active");
          });
        }
        usernameInput.value = tag.getAttribute("data-user");
        passwordInput.value = tag.getAttribute("data-pass");
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorMsg.classList.remove("show");

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      const submitBtn = document.getElementById("login-submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Authenticating...";

      AuthService.login(App.selectedRole, username, password)
        .then(userSession => {
          App.renderAppLayout(userSession, true); // Show welcome popup
        })
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In to Dashboard";
          errorMsg.textContent = err.message || err;
          errorMsg.classList.add("show");
        });
    });
  },

  // ===== Render Main App Layout =====
  renderAppLayout: (user, showWelcomePopup = false) => {
    const root = document.getElementById("app-root");
    const isAdmin = user.role === "admin";
    const isEngineer = user.role === "engineer";

    root.innerHTML = `
      <div class="app-layout">
        <aside class="sidebar">
          <div class="sidebar-brand">
            <div class="brand-icon">
              <img src="assets/logo.png" alt="Shree Pratham Logo" />
            </div>
            <div class="brand-text">
              <h2>Shree Pratham</h2>
              <span>Telemetry Network</span>
            </div>
          </div>

          <div class="sidebar-user">
            <div class="user-info ${isEngineer ? 'user-info-engineer-clickable' : ''}" id="sidebar-user-card" style="${isEngineer ? 'cursor: pointer; transition: all 0.2s ease;' : ''}" title="${isEngineer ? 'Click to view Engineer Profile Card' : ''}">
              <div class="user-avatar ${user.role}" style="${isEngineer ? 'border: 2px solid var(--primary); overflow: hidden; background: #fff;' : ''}">
                ${isEngineer ? `
                  <img src="assets/engineer_avatar.jpeg" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
                ` : (user.avatarText || 'US')}
              </div>
              <div>
                <div class="user-name" id="engineer-name-trigger" style="${isEngineer ? 'color: var(--primary); text-decoration: underline; font-weight: 700;' : ''}">
                  ${user.name}
                </div>
                <div class="user-role">
                  ${isAdmin ? 'Central Administrator' : (isEngineer ? 'Field Service Engineer' : 'Industry Plant Account')}
                </div>
              </div>
            </div>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section">
              <div class="nav-section-title">Navigation</div>
              
              <div class="nav-item active" data-view="dashboard">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span>Dashboard Overview</span>
              </div>

              ${(isAdmin || isEngineer) ? `
                <div class="nav-item" data-view="industries">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <span>Industry Management</span>
                </div>
              ` : ''}

              <div class="nav-item" data-view="analyzers">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span>Analyzer Monitoring</span>
              </div>

              ${!isEngineer ? `
                <div class="nav-item" data-view="sales">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <span>Sales & Payments</span>
                </div>
              ` : ''}

              <div class="nav-item" data-view="service">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
                <span>Service & PDF Reports</span>
              </div>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div class="nav-item" id="btn-logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              <span>Sign Out</span>
            </div>
          </div>
        </aside>

        <main class="main-content" id="main-view-container"></main>
      </div>

      <!-- Engineer Profile Card Modal -->
      <div class="modal-overlay hidden" id="modal-engineer-card">
        <div class="modal text-left p-6" style="max-width: 520px; border-radius: var(--radius-xl); background: #ffffff;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            <div style="display: flex; gap: 16px; align-items: center;">
              <div style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 3px solid var(--primary); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); flex-shrink: 0;">
                <img src="assets/engineer_avatar.jpeg" alt="Engineer Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <div>
                <h3 style="font-size: 20px; font-weight: 700; color: var(--text-bright); margin-bottom: 2px;">Chandan Aggarwal</h3>
                <div style="font-size: 13px; font-weight: 600; color: var(--primary); margin-bottom: 4px;">Senior Engineer</div>
                <span class="badge badge-success" style="font-size: 11px;"><span class="dot pulse"></span> ON DUTY / ACTIVE FIELD RESPONSE</span>
              </div>
            </div>
            <button class="modal-close" id="close-engineer-card-btn" style="font-size: 24px; color: var(--text-muted); background: transparent; border: none; cursor: pointer;">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Designation & Dept -->
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Designation & Department</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
                <div><span style="color: var(--text-secondary);">Designation:</span> <strong>Senior Engineer</strong></div>
                <div><span style="color: var(--text-secondary);">Employee ID:</span> <strong style="font-family: var(--font-mono); color: var(--primary);">ENG-2026-042</strong></div>
                <div><span style="color: var(--text-secondary);">Department:</span> <strong>CEMS & EQMS Ops</strong></div>
                <div><span style="color: var(--text-secondary);">Base Station:</span> <strong>On Rotation Basis</strong></div>
              </div>
            </div>

            <!-- Contact Details -->
            <div style="background: #f8fafc; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border);">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Engineer Contact Details</div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--primary);"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                  <span><strong>Mobile Phone:</strong> <a href="tel:+918851912882" style="color: var(--primary); text-decoration: none;">+91 88519 12882</a></span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--primary);"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span><strong>Email Address:</strong> <a href="mailto:shalenroy255@gmail.com" style="color: var(--primary); text-decoration: none;">shalenroy255@gmail.com</a></span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color: var(--primary);"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span><strong>Field Station:</strong> On Rotation Basis</span>
                </div>
              </div>
            </div>

          <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button class="btn btn-primary btn-md flex-1" id="btn-engineer-card-view-logs">
              View Service & Calibration Logs
            </button>
            <button class="btn btn-secondary btn-md" id="close-engineer-card-btn-2">
              Close Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Welcome Popup Modal -->
      <div class="modal-overlay ${showWelcomePopup ? '' : 'hidden'}" id="modal-welcome-popup">
        <div class="modal text-center p-6" style="max-width: 480px; border-radius: var(--radius-xl);">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary-dim); color: var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; border: 1px solid var(--primary-glow);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          </div>
          <h2 style="font-size: 22px; color: var(--primary); margin-bottom: 8px;">Welcome to Shree Pratham Dashboard</h2>
          <p class="text-sm text-secondary mb-6">
            Authenticated successfully as <strong>${user.name}</strong> (${isAdmin ? 'Admin' : (isEngineer ? 'Engineer' : 'Industry')}). Accessing real-time telemetry network and continuous analyzer monitoring.
          </p>
          <button class="btn btn-primary btn-lg w-full" id="close-welcome-popup-btn">
            Proceed to Dashboard
          </button>
        </div>
      </div>
    `;

    App.attachSidebarListeners(user);
    App.navigateTo("dashboard");

    // Close Welcome Modal Handler
    const welcomeModal = document.getElementById("modal-welcome-popup");
    const closeWelcomeBtn = document.getElementById("close-welcome-popup-btn");
    if (closeWelcomeBtn && welcomeModal) {
      closeWelcomeBtn.addEventListener("click", () => {
        welcomeModal.classList.add("hidden");
      });
    }
  },

  attachSidebarListeners: (user) => {
    const isEngineer = user.role === "engineer";
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        navItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        const view = item.getAttribute("data-view");
        App.navigateTo(view);
      });
    });

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthService.logout());

    // Engineer Profile Card Modal Event Listeners
    const engineerModal = document.getElementById("modal-engineer-card");
    const engineerTrigger = document.getElementById("engineer-name-trigger");
    const engineerUserCard = document.getElementById("sidebar-user-card");

    if (isEngineer && engineerModal) {
      const openModal = (e) => {
        e.stopPropagation();
        engineerModal.classList.remove("hidden");
      };

      if (engineerTrigger) engineerTrigger.addEventListener("click", openModal);
      if (engineerUserCard) engineerUserCard.addEventListener("click", openModal);

      const closeBtns = [
        document.getElementById("close-engineer-card-btn"),
        document.getElementById("close-engineer-card-btn-2")
      ];
      closeBtns.forEach(btn => {
        if (btn) btn.addEventListener("click", () => engineerModal.classList.add("hidden"));
      });

      const viewLogsBtn = document.getElementById("btn-engineer-card-view-logs");
      if (viewLogsBtn) {
        viewLogsBtn.addEventListener("click", () => {
          engineerModal.classList.add("hidden");
          App.navigateTo("service");
        });
      }
    }
  },

  navigateTo: (view) => {
    const user = AuthService.getCurrentUser();
    const container = document.getElementById("main-view-container");
    if (!user || !container) return;

    // Guard route: Sales page removed for Engineer role
    if (view === "sales" && user.role === "engineer") {
      App.showToast("Sales & Payments page is not accessible for Field Engineer accounts.", "warning");
      view = "dashboard";
    }

    App.currentView = view;

    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
      if (item.getAttribute("data-view") === view) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    if (view === "dashboard") {
      DashboardPage.render(container, user);
    } else if (view === "industries") {
      IndustriesPage.render(container, user);
    } else if (view === "analyzers") {
      AnalyzersPage.render(container, user);
    } else if (view === "sales") {
      SalesPage.render(container, user);
    } else if (view === "service") {
      ServicePage.render(container, user);
    }
  },

  showToast: (message, type = "info") => {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.className = "toast-container";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;

    toastContainer.appendChild(toast);
    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
