<<<<<<< HEAD
const configuredApi = (window.INSURANCE_API_BASE_URL || localStorage.getItem("insurance_api_base_url") || "").trim();
const localApi = "http://localhost:8080/api";
const API = (configuredApi || localApi).replace(/\/+$/, "");
let currentUser = null;
let eventSource = null;
let activeClaimFilter = "ALL";
let claimSearchQuery = "";
let currentDocBlobUrl = null;

const $ = (id) => document.getElementById(id);

/* =========================================================
   THEME CONTROLLER (FINTECH TEAL & SLATE)
   ========================================================= */
function initTheme() {
  const themeToggle = $("themeToggleBtn");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Listen to OS theme changes if user hasn't explicitly chosen
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("claim_theme")) {
        setTheme(e.matches ? "dark" : "light", false);
      }
    });
  } catch (err) {}
}

function setTheme(theme, persist = true) {
  document.documentElement.setAttribute("data-theme", theme);
  const metaTheme = document.querySelector('meta[name="color-scheme"]');
  if (metaTheme) {
    metaTheme.content = theme === "dark" ? "dark light" : "light dark";
  }
  if (persist) {
    localStorage.setItem("claim_theme", theme);
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  setTheme(next, true);
  showToast(`Switched to ${next === "dark" ? "Dark Slate" : "Clean Light"} mode`);
}

/* =========================================================
   AUTHENTICATION & NAVIGATION EVENTS
   ========================================================= */
=======
const API = window.location.protocol === "file:" ? "http://localhost:8080/api" : `${window.location.origin}/api`;
let currentUser = null;
let eventSource = null;
const $ = (id) => document.getElementById(id);

// Separate authentication screens: Login, Email Verification and Claimant Registration.
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
document.querySelectorAll("[data-view]").forEach((el) => {
  el.addEventListener("click", () => switchAuthView(el.dataset.view));
});

$("loginForm").addEventListener("submit", (e) => { e.preventDefault(); login(); });
$("verifyForm").addEventListener("submit", (e) => { e.preventDefault(); verifyOtp(); });
$("registerForm").addEventListener("submit", (e) => { e.preventDefault(); registerClaimant(); });
$("forgotForm").addEventListener("submit", (e) => { e.preventDefault(); forgotPassword(); });
$("resetPasswordForm").addEventListener("submit", (e) => { e.preventDefault(); resetPassword(); });
$("changePasswordForm").addEventListener("submit", (e) => { e.preventDefault(); changePassword(); });
$("resendOtpBtn").addEventListener("click", resendOtp);
$("logoutBtn").addEventListener("click", logout);
$("mobileLogoutBtn").addEventListener("click", logout);
$("refreshBtn").addEventListener("click", loadClaims);
$("claimForm").addEventListener("submit", submitClaim);
$("userForm").addEventListener("submit", createUser);
$("refreshUsersBtn").addEventListener("click", loadUsers);
$("actionCancelBtn").addEventListener("click", closeActionModal);
$("actionConfirmBtn").addEventListener("click", confirmClaimAction);
<<<<<<< HEAD
$("actionModal").addEventListener("click", (e) => {
  if (e.target === $("actionModal") || e.target.classList.contains("action-modal-backdrop")) {
    closeActionModal();
  }
});

// Document Preview Modal controls
$("docPreviewCloseBtn").addEventListener("click", closeDocPreviewModal);
const docBackdrop = $("docModalBackdrop");
if (docBackdrop) {
  docBackdrop.addEventListener("click", closeDocPreviewModal);
}

// Global escape key handler for modals
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeActionModal();
    closeDocPreviewModal();
  }
});

// Claims Search and Filtering
const searchInput = $("claimSearchInput");
const clearSearchBtn = $("clearSearchBtn");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    claimSearchQuery = e.target.value.trim().toLowerCase();
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle("hidden", !claimSearchQuery);
    }
    renderClaimsList();
  });
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    claimSearchQuery = "";
    clearSearchBtn.classList.add("hidden");
    renderClaimsList();
    searchInput.focus();
  });
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    activeClaimFilter = chip.dataset.filter || "ALL";
    renderClaimsList();
  });
});

// File upload drag & drop preview
const fileInput = $("document");
const fileZone = $("fileUploadZone");
const fileBadge = $("fileSelectedBadge");
const fileNameSpan = $("selectedFileName");

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      fileNameSpan.textContent = `${file.name} (${formatBytes(file.size)})`;
      fileBadge.classList.remove("hidden");
    } else {
      fileBadge.classList.add("hidden");
    }
  });
}

if (fileZone) {
  ["dragenter", "dragover"].forEach(name => {
    fileZone.addEventListener(name, (e) => {
      e.preventDefault();
      fileZone.classList.add("dragover");
    });
  });
  ["dragleave", "drop"].forEach(name => {
    fileZone.addEventListener(name, (e) => {
      e.preventDefault();
      fileZone.classList.remove("dragover");
    });
  });
  fileZone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      fileInput.files = e.dataTransfer.files;
      const file = fileInput.files[0];
      fileNameSpan.textContent = `${file.name} (${formatBytes(file.size)})`;
      fileBadge.classList.remove("hidden");
    }
  });
}

function switchAuthView(panelId) {
  ["loginPanel", "forgotPanel", "resetPasswordPanel", "verifyPanel", "registerPanel"].forEach((id) => {
    const el = $(id);
    if (el) el.classList.toggle("hidden", id !== panelId);
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.view === panelId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
=======
$("actionModal").addEventListener("click", (e) => { if (e.target === $("actionModal")) closeActionModal(); });

function switchAuthView(panelId) {
  ["loginPanel", "forgotPanel", "resetPasswordPanel", "verifyPanel", "registerPanel"].forEach((id) => $(id).classList.toggle("hidden", id !== panelId));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === panelId));
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  $("loginMessage").textContent = "";
  $("otpMessage").textContent = "";
  $("registerMessage").textContent = "";
  if ($("forgotMessage")) $("forgotMessage").textContent = "";
  if ($("resetMessage")) $("resetMessage").textContent = "";
}

<<<<<<< HEAD
function headers(extra = {}) {
  return { ...extra, Authorization: `Bearer ${currentUser?.token || ""}` };
}

/* =========================================================
   AUTH ACTIONS
   ========================================================= */
async function login() {
  $("loginMessage").style.color = "var(--primary)";
  $("loginMessage").textContent = "Signing in...";
  const rawUser = $("username").value.trim();
  const rawPass = $("password").value;
  if (!rawUser || !rawPass) {
    $("loginMessage").style.color = "var(--rose)";
    $("loginMessage").textContent = "Please enter both username and password.";
    return;
  }

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: rawUser,
        password: rawPass
      })
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Invalid username or password");
    currentUser = data;
    showDashboard();
    connectRealtime();
    await loadClaims();
    if (currentUser.role === "ADMIN") await loadUsers();
    showToast(`Welcome back, ${currentUser.fullName || currentUser.username}`);
  } catch (e) {
    $("loginMessage").style.color = "var(--rose)";
    $("loginMessage").textContent = e.message.includes("fetch")
      ? "Cannot connect to backend. Please ensure Spring Boot is running on port 8080."
      : e.message;
  }
}

async function registerClaimant() {
  $("registerMessage").style.color = "var(--primary)";
  $("registerMessage").textContent = "Creating account and dispatching OTP...";
=======
function headers(extra = {}) { return { ...extra, Authorization: `Bearer ${currentUser?.token || ""}` }; }

async function login() {
  $("loginMessage").textContent = "Signing in...";
  try {
    const response = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: $("username").value.trim(), password: $("password").value }) });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Login failed");
    currentUser = data;
    showDashboard(); connectRealtime(); await loadClaims(); if (currentUser.role === "ADMIN") await loadUsers();
  } catch (e) { $("loginMessage").textContent = e.message.includes("fetch") ? "Cannot connect to backend. Run Spring Boot first." : e.message; }
}

async function registerClaimant() {
  $("registerMessage").textContent = "Creating account and sending OTP...";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  const body = {
    fullName: $("regFullName").value.trim(),
    email: $("regEmail").value.trim(),
    username: $("regUsername").value.trim(),
    password: $("regPassword").value
  };
  try {
<<<<<<< HEAD
    const response = await fetch(`${API}/auth/register-claimant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Registration failed");
    $("registerMessage").style.color = "var(--emerald)";
    $("registerMessage").textContent = data.message || "Account created. OTP sent to your email.";
    $("otpUsername").value = body.username;
    switchAuthView("verifyPanel");

    if (data.devOtp) {
      // Dev mode: SMTP not configured — show OTP on screen and auto-fill
      $("otp").value = data.devOtp;
      $("otpMessage").style.color = "var(--amber, #f59e0b)";
      $("otpMessage").innerHTML =
        `<strong>⚠️ Dev Mode — No Email Sent</strong><br>` +
        `Your OTP: <span style="font-size:1.6em;font-weight:800;letter-spacing:.25em;` +
        `color:var(--primary);background:var(--card-bg,rgba(0,0,0,.15));` +
        `padding:2px 8px;border-radius:6px">${data.devOtp}</span><br>` +
        `<small style="opacity:.75">${data.devNote || "Set MAIL_USERNAME env var for real email delivery."}</small>`;
    } else {
      $("otpMessage").style.color = "var(--emerald)";
      $("otpMessage").textContent = "Verification code dispatched. Check your email and enter the 6-digit OTP.";
    }
    $("registerForm").reset();
  } catch (e) {
    $("registerMessage").style.color = "var(--rose)";
=======
    const response = await fetch(`${API}/auth/register-claimant`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Registration failed");
    $("registerMessage").style.color = "#2f6d4f";
    $("registerMessage").textContent = data.message || "Account created. OTP sent to your email.";
    $("otpUsername").value = body.username;
    switchAuthView("verifyPanel");
    $("otpMessage").style.color = "#2f6d4f";
    $("otpMessage").textContent = "OTP sent. Check your email and enter the 6-digit code.";
    $("registerForm").reset();
  } catch (e) {
    $("registerMessage").style.color = "#b23b3b";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
    $("registerMessage").textContent = e.message;
  }
}

<<<<<<< HEAD

async function verifyOtp() {
  $("otpMessage").style.color = "var(--rose)";
  $("otpMessage").textContent = "Verifying code...";
  try {
    const response = await fetch(`${API}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: $("otpUsername").value.trim(),
        otp: $("otp").value.trim()
      })
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Verification failed");
    $("otpMessage").style.color = "var(--emerald)";
    $("otpMessage").textContent = data.message || "Email verified successfully.";
    $("otp").value = "";
    $("username").value = $("otpUsername").value.trim();
    showToast("Email verified! You can now log in.");
    setTimeout(() => switchAuthView("loginPanel"), 700);
  } catch (e) {
    $("otpMessage").textContent = e.message;
  }
}

async function resendOtp() {
  $("otpMessage").style.color = "var(--rose)";
  try {
    const username = $("otpUsername").value.trim();
    if (!username) throw new Error("Enter your username first");
    const response = await fetch(`${API}/auth/resend-otp?username=${encodeURIComponent(username)}`, { method: "POST" });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Could not resend OTP");
    $("otpMessage").style.color = "var(--emerald)";
    $("otpMessage").textContent = data.message || "New OTP dispatched to your registered email.";
  } catch (e) {
    $("otpMessage").textContent = e.message;
  }
=======
async function verifyOtp() {
  $("otpMessage").style.color = "#b23b3b";
  $("otpMessage").textContent = "Verifying...";
  try {
    const response = await fetch(`${API}/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: $("otpUsername").value.trim(), otp: $("otp").value.trim() }) });
    const data = await json(response); if (!response.ok) throw new Error(data.message || "Verification failed");
    $("otpMessage").style.color = "#2f6d4f";
    $("otpMessage").textContent = data.message;
    $("otp").value = "";
    $("username").value = $("otpUsername").value.trim();
    setTimeout(() => switchAuthView("loginPanel"), 700);
  } catch (e) { $("otpMessage").textContent = e.message; }
}

async function resendOtp() {
  $("otpMessage").style.color = "#b23b3b";
  try {
    const username = $("otpUsername").value.trim(); if (!username) throw new Error("Enter your username first");
    const response = await fetch(`${API}/auth/resend-otp?username=${encodeURIComponent(username)}`, { method: "POST" });
    const data = await json(response); if (!response.ok) throw new Error(data.message || "Could not resend OTP");
    $("otpMessage").style.color = "#2f6d4f";
    $("otpMessage").textContent = data.message;
  } catch (e) { $("otpMessage").textContent = e.message; }
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

async function forgotPassword() {
  const email = $("forgotEmail").value.trim();
<<<<<<< HEAD
  $("forgotMessage").style.color = "var(--rose)";
  $("forgotMessage").textContent = "Sending reset OTP...";
  try {
    const response = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Could not request password reset");
    $("resetEmail").value = email;
    $("forgotMessage").style.color = "var(--emerald)";
    $("forgotMessage").textContent = data.message || "If the account exists, a reset OTP has been sent.";
    setTimeout(() => switchAuthView("resetPasswordPanel"), 900);
  } catch (e) {
    $("forgotMessage").textContent = e.message.includes("fetch")
      ? "Cannot connect to backend. Please check port 8080."
      : e.message;
  }
=======
  $("forgotMessage").style.color = "#b23b3b";
  $("forgotMessage").textContent = "Sending reset OTP...";
  try {
    const response = await fetch(`${API}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Could not request password reset");
    $("resetEmail").value = email;
    $("forgotMessage").style.color = "#2f6d4f";
    $("forgotMessage").textContent = data.message || "If the account exists, a reset OTP has been sent.";
    setTimeout(() => switchAuthView("resetPasswordPanel"), 900);
  } catch (e) { $("forgotMessage").textContent = e.message.includes("fetch") ? "Cannot connect to backend. Run Spring Boot first." : e.message; }
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

async function resetPassword() {
  const email = $("resetEmail").value.trim();
  const otp = $("resetOtp").value.trim();
  const newPassword = $("resetNewPassword").value;
  const confirmPassword = $("resetConfirmPassword").value;
<<<<<<< HEAD
  $("resetMessage").style.color = "var(--rose)";
  if (newPassword !== confirmPassword) {
    $("resetMessage").textContent = "New password and confirmation do not match.";
    return;
  }
  $("resetMessage").textContent = "Resetting password...";
  try {
    const response = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword })
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Password reset failed");
    $("resetMessage").style.color = "var(--emerald)";
    $("resetMessage").textContent = data.message || "Password reset successfully.";
    $("resetPasswordForm").reset();
    showToast("Password updated successfully. Please sign in.");
    setTimeout(() => switchAuthView("loginPanel"), 1200);
  } catch (e) {
    $("resetMessage").textContent = e.message.includes("fetch")
      ? "Cannot connect to backend. Please check port 8080."
      : e.message;
  }
=======
  $("resetMessage").style.color = "#b23b3b";
  if (newPassword !== confirmPassword) { $("resetMessage").textContent = "New password and confirmation do not match."; return; }
  $("resetMessage").textContent = "Resetting password...";
  try {
    const response = await fetch(`${API}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, otp, newPassword }) });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Password reset failed");
    $("resetMessage").style.color = "#2f6d4f";
    $("resetMessage").textContent = data.message || "Password reset successfully.";
    $("resetPasswordForm").reset();
    setTimeout(() => switchAuthView("loginPanel"), 1200);
  } catch (e) { $("resetMessage").textContent = e.message.includes("fetch") ? "Cannot connect to backend. Run Spring Boot first." : e.message; }
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

async function changePassword() {
  const currentPassword = $("currentPassword").value;
  const newPassword = $("newPasswordChange").value;
  const confirmPassword = $("confirmPasswordChange").value;
<<<<<<< HEAD
  $("changePasswordMessage").style.color = "var(--rose)";
  if (newPassword !== confirmPassword) {
    $("changePasswordMessage").textContent = "New password and confirmation do not match.";
    return;
  }
  $("changePasswordMessage").textContent = "Changing password...";
  try {
    const response = await fetch(`${API}/auth/change-password`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Password change failed");
    $("changePasswordMessage").style.color = "var(--emerald)";
    $("changePasswordMessage").textContent = data.message || "Password changed successfully.";
    $("changePasswordForm").reset();
    showToast("Password changed! Please sign in again.");
    setTimeout(() => logout(), 1200);
  } catch (e) {
    $("changePasswordMessage").textContent = e.message;
  }
}

/* =========================================================
   DASHBOARD NAVIGATION & DISPLAY
   ========================================================= */
=======
  $("changePasswordMessage").style.color = "#b23b3b";
  if (newPassword !== confirmPassword) { $("changePasswordMessage").textContent = "New password and confirmation do not match."; return; }
  $("changePasswordMessage").textContent = "Changing password...";
  try {
    const response = await fetch(`${API}/auth/change-password`, { method: "POST", headers: { ...headers(), "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Password change failed");
    $("changePasswordMessage").style.color = "#2f6d4f";
    $("changePasswordMessage").textContent = data.message || "Password changed successfully.";
    $("changePasswordForm").reset();
    setTimeout(() => logout(), 1200);
  } catch (e) { $("changePasswordMessage").textContent = e.message; }
}

>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
function showDashboard() {
  $("authView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  const role = currentUser.role;
  const roleName = prettyRole(role);
<<<<<<< HEAD
  $("userInfo").textContent = `${currentUser.fullName || currentUser.username} • ${roleName} • ${currentUser.email}`;
  $("dashboardHeading").textContent = `${roleName} Console`;
  $("welcomeTitle").textContent = `Welcome, ${currentUser.fullName || currentUser.username}`;
  $("welcomeText").textContent = role === "CLAIMANT"
    ? "Submit, follow, and verify your claims through real-time audit updates."
    : `${roleName} workspace — review incoming queue and complete authorized workflow tasks.`;
  $("roleBadge").textContent = roleName.toUpperCase();
  $("sidebarName").textContent = currentUser.fullName || currentUser.username;
  $("sidebarRole").textContent = roleName;
  $("avatarLetter").textContent = (currentUser.fullName || currentUser.username || "U").charAt(0).toUpperCase();

  buildNavigation();
  buildQuickActions();

  const defaultView = role === "CLAIMANT" ? "overview" : "claims";
  showDashboardView(defaultView);
  renderOverview(window.__claims || []);

  $("claimsTitle").textContent = role === "CLAIMANT" ? "My Claims Portfolio" : "All Claims Registry";
  $("claimsHint").textContent = role === "CLAIMANT"
    ? "Track your submitted claims, review loss evaluations, and inspect settlement records."
    : "Inspect state, run verification / survey / approval actions, and review cryptographically signed events.";
}

function buildNavigation() {
  const items = [{ id: "overview", label: "Dashboard", icon: "⌂" }];
  if (currentUser.role === "ADMIN") items.push({ id: "users", label: "Staff Access", icon: "♟" });
  if (currentUser.role === "CLAIMANT") items.push({ id: "claim", label: "Submit Claim", icon: "＋" });
  items.push({ id: "claims", label: currentUser.role === "CLAIMANT" ? "My Claims" : "Claims", icon: "▣" });
  items.push({ id: "password", label: "Security", icon: "⌁" });

  $("sideNav").innerHTML = items
    .map((i) => `<button class="nav-item" data-dash-view="${i.id}"><span class="nav-icon">${i.icon}</span>${i.label}</button>`)
    .join("");

  document.querySelectorAll("[data-dash-view]").forEach((btn) => {
    btn.addEventListener("click", () => showDashboardView(btn.dataset.dashView));
  });
=======
  $("userInfo").textContent = `${currentUser.fullName} • ${roleName} • ${currentUser.email}`;
  $("dashboardHeading").textContent = `${roleName} Dashboard`;
  $("welcomeTitle").textContent = `Welcome, ${currentUser.fullName}`;
  $("welcomeText").textContent = role === "CLAIMANT" ? "Submit and track your insurance claims." : `${roleName} workspace — complete only the tasks assigned to your role.`;
  $("roleBadge").textContent = roleName.toUpperCase();
  $("sidebarName").textContent = currentUser.fullName;
  $("sidebarRole").textContent = roleName;
  $("avatarLetter").textContent = (currentUser.fullName || currentUser.username || "U").charAt(0).toUpperCase();
  buildNavigation();
  buildQuickActions();
  const defaultView = role === "CLAIMANT" ? "overview" : "claims";
  showDashboardView(defaultView);
  renderOverview(window.__claims || []);
  $("claimsTitle").textContent = role === "CLAIMANT" ? "My Claims" : "All Claims";
  $("claimsHint").textContent = role === "CLAIMANT" ? "Track your submitted claims and their workflow history." : "Track current state, available role actions and workflow history.";
}

function buildNavigation() {
  const items = [{id:"overview",label:"Dashboard",icon:"⌂"}];
  if (currentUser.role === "ADMIN") items.push({id:"users",label:"User Management",icon:"♟"});
  if (currentUser.role === "CLAIMANT") items.push({id:"claim",label:"Submit Claim",icon:"＋"});
  items.push({id:"claims",label:currentUser.role === "CLAIMANT" ? "My Claims" : "Claims",icon:"▣"});
  items.push({id:"password",label:"Change Password",icon:"⌁"});
  $("sideNav").innerHTML = items.map(i => `<button class="nav-item" data-dash-view="${i.id}"><span class="nav-icon">${i.icon}</span>${i.label}</button>`).join("");
  document.querySelectorAll("[data-dash-view]").forEach(btn => btn.addEventListener("click", () => showDashboardView(btn.dataset.dashView)));
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

function buildQuickActions() {
  const actions = [];
<<<<<<< HEAD
  if (currentUser.role === "ADMIN") actions.push({ view: "users", title: "Manage Staff", text: "Provision and configure authorized officer accounts." });
  if (currentUser.role === "CLAIMANT") actions.push({ view: "claim", title: "Submit a Claim", text: "Upload policy documents and request payout." });
  actions.push({ view: "claims", title: currentUser.role === "CLAIMANT" ? "View My Claims" : "Open Claims Queue", text: "Process pending items, inspect history, or settle payment." });

  $("quickActions").innerHTML = actions
    .map((a) => `<button class="quick-btn" data-quick-view="${a.view}"><strong>${a.title} →</strong><small>${a.text}</small></button>`)
    .join("");

  document.querySelectorAll("[data-quick-view]").forEach((btn) => {
    btn.addEventListener("click", () => showDashboardView(btn.dataset.quickView));
  });
}

function showDashboardView(view) {
  const allowed = ["overview", "users", "claim", "claims", "password"];
  if (!allowed.includes(view)) view = "overview";
  if (view === "users" && currentUser.role !== "ADMIN") view = "overview";
  if (view === "claim" && currentUser.role !== "CLAIMANT") view = "overview";

  document.querySelectorAll(".dash-view").forEach((el) => {
    el.classList.toggle("hidden", el.id !== `view-${view}`);
  });
  document.querySelectorAll("[data-dash-view]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.dashView === view);
  });

=======
  if (currentUser.role === "ADMIN") actions.push({view:"users",title:"Manage Staff",text:"Create and manage authorized staff accounts."});
  if (currentUser.role === "CLAIMANT") actions.push({view:"claim",title:"Submit a Claim",text:"Start a new insurance claim."});
  actions.push({view:"claims",title:currentUser.role === "CLAIMANT" ? "View My Claims" : "Open Claims",text:"Review status, history and available actions."});
  $("quickActions").innerHTML = actions.map(a => `<button class="quick-btn" data-quick-view="${a.view}"><strong>${a.title} →</strong><small>${a.text}</small></button>`).join("");
  document.querySelectorAll("[data-quick-view]").forEach(btn => btn.addEventListener("click", () => showDashboardView(btn.dataset.quickView)));
}

function showDashboardView(view) {
  const allowed = ["overview","users","claim","claims","password"];
  if (!allowed.includes(view)) view = "overview";
  if (view === "users" && currentUser.role !== "ADMIN") view = "overview";
  if (view === "claim" && currentUser.role !== "CLAIMANT") view = "overview";
  document.querySelectorAll(".dash-view").forEach(el => el.classList.toggle("hidden", el.id !== `view-${view}`));
  document.querySelectorAll("[data-dash-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.dashView === view));
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  if (view === "users") loadUsers();
  if (view === "claims") loadClaims();
  if (view === "overview") renderOverview(window.__claims || []);
}

async function logout() {
<<<<<<< HEAD
  try {
    await fetch(`${API}/auth/logout`, { method: "POST", headers: headers() });
  } catch {}
  if (eventSource) eventSource.close();
  eventSource = null;
  currentUser = null;
  window.__claims = [];
  $("dashboardView").classList.add("hidden");
  $("authView").classList.remove("hidden");
  $("liveBadge").classList.add("hidden");
  switchAuthView("loginPanel");
  showToast("Logged out successfully.");
=======
  try { await fetch(`${API}/auth/logout`, { method: "POST", headers: headers() }); } catch {}
  if (eventSource) eventSource.close(); eventSource = null; currentUser = null;
  $("dashboardView").classList.add("hidden"); $("authView").classList.remove("hidden"); $("liveBadge").classList.add("hidden"); switchAuthView("loginPanel");
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

function connectRealtime() {
  if (eventSource) eventSource.close();
  eventSource = new EventSource(`${API}/events?username=${encodeURIComponent(currentUser.username)}`);
  eventSource.addEventListener("connected", () => $("liveBadge").classList.remove("hidden"));
<<<<<<< HEAD
  eventSource.addEventListener("claim-update", async (event) => {
    try {
      const claim = JSON.parse(event.data);
      showToast(`Claim #${claim.id} updated to ${prettyStatus(claim.status)}`);
      await loadClaims();
    } catch (e) {}
  });
  eventSource.onerror = () => $("liveBadge").classList.add("hidden");
}

/* =========================================================
   CLAIMS OPERATIONS & RENDERING
   ========================================================= */
async function submitClaim(event) {
  event.preventDefault();
  const file = $("document").files[0];
  if (!file) return;

  const form = new FormData();
  form.append("username", currentUser.username);
  form.append("policyNumber", $("policyNumber").value.trim());
  form.append("amount", $("amount").value);
  form.append("description", $("description").value.trim());
  form.append("document", file);

  $("submitMessage").style.color = "var(--primary)";
  $("submitMessage").textContent = "Submitting claim...";
  try {
    const response = await fetch(`${API}/claims`, {
      method: "POST",
      headers: headers(),
      body: form
    });
    const data = await json(response);
    if (!response.ok) throw new Error(data.message || "Claim submission failed");
    $("submitMessage").style.color = "var(--emerald)";
    $("submitMessage").textContent = `Claim #${data.id} submitted successfully.`;
    $("claimForm").reset();
    if ($("fileSelectedBadge")) $("fileSelectedBadge").classList.add("hidden");
    showToast(`Claim #${data.id} created successfully!`);
    await loadClaims();
    setTimeout(() => showDashboardView("claims"), 800);
  } catch (e) {
    $("submitMessage").style.color = "var(--rose)";
    $("submitMessage").textContent = e.message;
  }
=======
  eventSource.addEventListener("claim-update", async (event) => { const claim = JSON.parse(event.data); showToast(`Claim #${claim.id} updated to ${prettyStatus(claim.status)}`); await loadClaims(); });
  eventSource.onerror = () => $("liveBadge").classList.add("hidden");
}

async function submitClaim(event) {
  event.preventDefault(); const file = $("document").files[0]; if (!file) return;
  const form = new FormData(); form.append("username", currentUser.username); form.append("policyNumber", $("policyNumber").value.trim()); form.append("amount", $("amount").value); form.append("description", $("description").value.trim()); form.append("document", file);
  $("submitMessage").textContent = "Submitting...";
  try { const response = await fetch(`${API}/claims`, { method: "POST", headers: headers(), body: form }); const data = await json(response); if (!response.ok) throw new Error(data.message || "Claim submission failed"); $("submitMessage").textContent = `Claim #${data.id} submitted successfully.`; $("claimForm").reset(); await loadClaims(); }
  catch (e) { $("submitMessage").textContent = e.message; }
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

async function loadClaims() {
  if (!currentUser) return;
<<<<<<< HEAD
  try {
    const url = currentUser.role === "CLAIMANT" ? `${API}/claims/mine` : `${API}/claims`;
    const response = await fetch(url, { headers: headers() });
    const claims = await json(response);
    if (!response.ok) throw new Error(claims.message || "Could not load claims");
    window.__claims = Array.isArray(claims) ? claims : [];
    updateStats(window.__claims);
    renderOverview(window.__claims);
    renderClaimsList();
  } catch (e) {
    $("claimsList").innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

function filterClaims(claims) {
  return claims.filter((c) => {
    // 1. Status Filter
    if (activeClaimFilter === "PENDING") {
      if (!["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "FRAUD_REVIEW"].includes(c.status)) return false;
    } else if (activeClaimFilter === "APPROVED") {
      if (c.status !== "APPROVED") return false;
    } else if (activeClaimFilter === "SETTLED") {
      if (c.status !== "SETTLED") return false;
    } else if (activeClaimFilter === "REJECTED") {
      if (!["REJECTED", "FRAUD_REVIEW"].includes(c.status)) return false;
    }

    // 2. Search Query
    if (claimSearchQuery) {
      const matchId = String(c.id).includes(claimSearchQuery);
      const matchPolicy = (c.policyNumber || "").toLowerCase().includes(claimSearchQuery);
      const matchName = (c.claimantName || "").toLowerCase().includes(claimSearchQuery);
      const matchDesc = (c.description || "").toLowerCase().includes(claimSearchQuery);
      if (!matchId && !matchPolicy && !matchName && !matchDesc) return false;
    }

    return true;
  });
}

function renderClaimsList() {
  const allClaims = window.__claims || [];
  const filtered = filterClaims(allClaims);

  const countBar = $("claimsCountBar");
  if (countBar) {
    if (claimSearchQuery || activeClaimFilter !== "ALL") {
      countBar.textContent = `Showing ${filtered.length} of ${allClaims.length} claims`;
    } else {
      countBar.textContent = `Showing all ${allClaims.length} claims in registry`;
    }
  }

  if (!filtered.length) {
    $("claimsList").innerHTML = `
      <div class="empty">
        <div style="font-size:2rem;margin-bottom:8px;">🔍</div>
        <b>No matching claims found</b>
        <p style="margin-top:4px;">Try modifying your search query or status filter.</p>
      </div>`;
    return;
  }

  $("claimsList").innerHTML = filtered.map((c) => {
    const paymentBlock = (c.status === "APPROVED" || c.status === "SETTLED")
      ? `
        <div class="payment-summary">
          <div class="payment-summary-title">Financial Settlement Execution</div>
=======
  try { const url = currentUser.role === "CLAIMANT" ? `${API}/claims/mine` : `${API}/claims`; const response = await fetch(url, { headers: headers() }); const claims = await json(response); if (!response.ok) throw new Error(claims.message || "Could not load claims"); renderClaims(claims); renderOverview(claims); }
  catch (e) { $("claimsList").innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`; }
}

function renderClaims(claims) {
  window.__claims = claims;
  updateStats(claims);
  if (!claims.length) {
    $("claimsList").innerHTML = `<div class="empty">No claims submitted yet.</div>`;
    return;
  }

  $("claimsList").innerHTML = claims.map(c => {
    const paymentBlock = (c.status === "APPROVED" || c.status === "SETTLED")
      ? `
        <div class="payment-summary">
          <div class="payment-summary-title">Payment</div>
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
          ${c.status === "SETTLED"
            ? `
              <div class="payment-grid">
                <div><span>Method</span><strong>${escapeHtml(paymentMethodLabel(c.paymentMethod))}</strong></div>
<<<<<<< HEAD
                <div><span>Settlement Amount</span><strong>₹${Number(c.settlementAmount ?? c.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong></div>
                <div><span>UTR / Reference</span><strong class="copyable-ref" data-copy-ref="${escapeHtml(c.transactionReference || "-")}" title="Click to copy">${escapeHtml(c.transactionReference || "-")} 📋</strong></div>
                <div><span>Settled On</span><strong>${formatDate(c.settlementDate)}</strong></div>
              </div>`
            : `<div class="payment-pending">Approved amount: <strong>₹${Number(c.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong> — awaiting Finance Officer disbursal.</div>`}
=======
                <div><span>Settlement Amount</span><strong>₹${Number(c.settlementAmount ?? c.amount).toLocaleString("en-IN", {minimumFractionDigits:2})}</strong></div>
                <div><span>Reference</span><strong>${escapeHtml(c.transactionReference || "-")}</strong></div>
                <div><span>Settled On</span><strong>${formatDate(c.settlementDate)}</strong></div>
              </div>`
            : `<div class="payment-pending">Approved amount: <strong>₹${Number(c.amount).toLocaleString("en-IN", {minimumFractionDigits:2})}</strong> — awaiting Finance Officer settlement.</div>`}
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
        </div>`
      : "";

    return `
      <article class="claim-card">
        <div class="claim-top">
<<<<<<< HEAD
          <h4>#CLM-${c.id}</h4>
=======
          <h4>Claim #${c.id}</h4>
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
          <span class="status ${statusClass(c.status)}">${prettyStatus(c.status)}</span>
        </div>
        <div class="meta">
          <div><b>Claimant:</b> ${escapeHtml(c.claimantName)}</div>
<<<<<<< HEAD
          <div><b>Policy:</b> <span class="mono-value">${escapeHtml(c.policyNumber)}</span></div>
          <div><b>Claim Amount:</b> <span class="mono-value">₹${Number(c.amount).toLocaleString("en-IN")}</span></div>
          <div><b>Last Updated:</b> ${formatDate(c.updatedAt)}</div>
          <div><b>Description:</b> ${escapeHtml(c.description)}</div>
          <div><b>Document:</b> <a href="${API}/claims/${c.id}/document" data-doc-id="${c.id}" data-doc-name="${escapeHtml(c.documentOriginalName || `Claim_${c.id}_Document`)}" class="doc-link">📄 ${escapeHtml(c.documentOriginalName || "View Document")}</a></div>
        </div>
        <div class="progress">
          <span class="progress-label">Workflow Progress Pipeline</span>
          <div class="steps">${workflowSteps(c.status)}</div>
        </div>
        ${paymentBlock}
        ${actionButtons(c)}
        <div class="history">
          <button type="button" class="secondary" data-history="${c.id}">View Audit Trail ▾</button>
          <div id="history-${c.id}"></div>
        </div>
      </article>`;
  }).join("");

  // Event Listeners for claim cards
  document.querySelectorAll("[data-history]").forEach((btn) => {
    btn.addEventListener("click", () => toggleHistory(Number(btn.dataset.history)));
  });

  document.querySelectorAll(".doc-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      openDocPreviewModal(a.href, a.dataset.docName || "Claim Document");
    });
  });

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openActionModal(Number(btn.dataset.id), btn.dataset.action);
    });
  });

  document.querySelectorAll("[data-copy-ref]").forEach((el) => {
    el.addEventListener("click", () => {
      const ref = el.dataset.copyRef;
      if (ref && ref !== "-") {
        navigator.clipboard?.writeText(ref);
        showToast(`Reference ${ref} copied to clipboard!`);
      }
    });
  });
}

/* =========================================================
   INLINE DOCUMENT PREVIEW MODAL
   ========================================================= */
async function openDocPreviewModal(url, docName) {
  const modal = $("docPreviewModal");
  const content = $("docPreviewContent");
  const title = $("docPreviewTitle");
  const meta = $("docPreviewMeta");
  const downloadBtn = $("docPreviewDownloadBtn");
  const newTabBtn = $("docPreviewNewTabBtn");

  title.textContent = docName;
  meta.textContent = "Fetching document securely...";
  content.innerHTML = `<div class="doc-loading-spinner">Retrieving document from server...</div>`;
  modal.classList.remove("hidden");

  try {
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Unable to retrieve document from server");

    const contentType = res.headers.get("content-type") || "";
    const blob = await res.blob();

    if (currentDocBlobUrl) {
      URL.revokeObjectURL(currentDocBlobUrl);
    }
    currentDocBlobUrl = URL.createObjectURL(blob);

    downloadBtn.href = currentDocBlobUrl;
    downloadBtn.download = docName;
    newTabBtn.href = currentDocBlobUrl;

    meta.textContent = `${formatBytes(blob.size)} • ${contentType || "Binary"}`;

    const isImage = contentType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(docName);
    const isPdf = contentType.includes("pdf") || /\.pdf$/i.test(docName);

    if (isImage) {
      content.innerHTML = `<img src="${currentDocBlobUrl}" alt="${escapeHtml(docName)}" class="doc-preview-img" />`;
    } else if (isPdf) {
      content.innerHTML = `<iframe src="${currentDocBlobUrl}" class="doc-preview-frame" title="PDF Document Preview"></iframe>`;
    } else {
      content.innerHTML = `
        <div class="doc-fallback-card">
          <div style="font-size:3rem;margin-bottom:12px;">📁</div>
          <h4>${escapeHtml(docName)}</h4>
          <p style="margin:8px 0 16px;">This document format (${contentType}) cannot be rendered directly in-browser.</p>
          <a class="btn btn-primary" href="${currentDocBlobUrl}" download="${escapeHtml(docName)}">Download Document</a>
        </div>`;
    }
  } catch (err) {
    content.innerHTML = `<div class="empty" style="color:var(--rose)">${escapeHtml(err.message)}</div>`;
  }
}

function closeDocPreviewModal() {
  $("docPreviewModal").classList.add("hidden");
  $("docPreviewContent").innerHTML = "";
  if (currentDocBlobUrl) {
    URL.revokeObjectURL(currentDocBlobUrl);
    currentDocBlobUrl = null;
  }
}

/* =========================================================
   OVERVIEW & KPI METRICS
   ========================================================= */
=======
          <div><b>Policy:</b> ${escapeHtml(c.policyNumber)}</div>
          <div><b>Amount:</b> ₹${Number(c.amount).toLocaleString("en-IN")}</div>
          <div><b>Updated:</b> ${formatDate(c.updatedAt)}</div>
          <div><b>Description:</b> ${escapeHtml(c.description)}</div>
          <div><b>Document:</b> <a href="${API}/claims/${c.id}/document" data-doc-id="${c.id}" class="doc-link">${escapeHtml(c.documentOriginalName || "View")}</a></div>
        </div>
        <div class="progress"><span class="progress-label">Workflow</span><div class="steps">${workflowSteps(c.status)}</div></div>
        ${paymentBlock}
        ${actionButtons(c)}
        <div class="history"><button type="button" class="secondary" data-history="${c.id}">View History</button><div id="history-${c.id}"></div></div>
      </article>`;
  }).join("");

  document.querySelectorAll("[data-history]").forEach(btn => btn.addEventListener("click", () => toggleHistory(Number(btn.dataset.history))));
  document.querySelectorAll(".doc-link").forEach(a => a.addEventListener("click", async (e) => { e.preventDefault(); try { const r = await fetch(a.href, { headers: headers() }); if (!r.ok) throw new Error("Unable to open document"); const blob = await r.blob(); const url = URL.createObjectURL(blob); window.open(url, "_blank"); setTimeout(() => URL.revokeObjectURL(url), 60000); } catch(err) { alert(err.message); } }));
  document.querySelectorAll("[data-action]").forEach(btn => btn.addEventListener("click", (e) => { e.preventDefault(); openActionModal(Number(btn.dataset.id), btn.dataset.action); }));
}


>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
function renderOverview(claims) {
  const visible = Array.isArray(claims) ? claims : [];
  const claim = pickDashboardClaim(visible);
  $("glanceCount").textContent = `${visible.length} ${visible.length === 1 ? "claim" : "claims"}`;
<<<<<<< HEAD

=======
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  if (!claim) {
    $("currentClaimTitle").textContent = "No active claim";
    $("currentClaimStatus").textContent = "—";
    $("currentClaimStatus").className = "status status-muted";
    $("currentPolicy").textContent = "—";
    $("currentAmount").textContent = "—";
    $("currentIncident").textContent = "—";
<<<<<<< HEAD
    $("journeyCurrentText").textContent = "Submit a claim to begin your verification journey.";
    $("journeyNextText").textContent = "";
    $("claimJourney").innerHTML = emptyJourney();
    $("recentUpdate").textContent = "No recent update.";
    $("glanceText").textContent = currentUser?.role === "CLAIMANT"
      ? "Your submitted claims will appear here."
      : "Claims requiring your role review will appear here.";
=======
    $("journeyCurrentText").textContent = "Submit a claim to begin your journey.";
    $("journeyNextText").textContent = "";
    $("claimJourney").innerHTML = emptyJourney();
    $("recentUpdate").textContent = "No recent update.";
    $("glanceText").textContent = currentUser?.role === "CLAIMANT" ? "Your submitted claims will appear here." : "Claims requiring your role will appear here.";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
    $("currentClaimButton").textContent = currentUser?.role === "CLAIMANT" ? "Submit a Claim →" : "Open Claims →";
    $("currentClaimButton").onclick = () => showDashboardView(currentUser?.role === "CLAIMANT" ? "claim" : "claims");
    return;
  }
<<<<<<< HEAD

  $("currentClaimTitle").textContent = `#CLM-${claim.id}`;
=======
  $("currentClaimTitle").textContent = `Claim #${claim.id}`;
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  $("currentClaimStatus").textContent = prettyStatus(claim.status);
  $("currentClaimStatus").className = `status ${statusClass(claim.status)}`;
  $("currentPolicy").textContent = claim.policyNumber || "—";
  $("currentAmount").textContent = `₹${Number(claim.amount || 0).toLocaleString("en-IN")}`;
  $("currentIncident").textContent = claim.incidentType || "Insurance claim";
  $("claimJourney").innerHTML = dashboardJourney(claim.status);
<<<<<<< HEAD

  const next = nextWorkflowStep(claim.status);
  $("journeyCurrentText").textContent = `Current Stage: ${prettyStatus(claim.status)}`;
  $("journeyNextText").textContent = next ? `Next: ${prettyStatus(next)}` : "Journey Completed";
  $("glanceText").textContent = claim.description ? truncate(claim.description, 90) : `Last updated ${formatRelative(claim.updatedAt || claim.createdAt)}.`;
  $("recentUpdate").innerHTML = `<b>${escapeHtml(prettyStatus(claim.status))}</b><span>Claim #CLM-${escapeHtml(claim.id)}</span><time>${formatRelative(claim.updatedAt || claim.createdAt)}</time>`;
  $("currentClaimButton").textContent = "View Claim Details →";
=======
  const next = nextWorkflowStep(claim.status);
  $("journeyCurrentText").textContent = `Current stage: ${prettyStatus(claim.status)}`;
  $("journeyNextText").textContent = next ? `Next: ${prettyStatus(next)}` : "Journey complete";
  $("glanceText").textContent = claim.description ? truncate(claim.description, 90) : `Last updated ${formatRelative(claim.updatedAt || claim.createdAt)}.`;
  $("recentUpdate").innerHTML = `<b>${escapeHtml(prettyStatus(claim.status))}</b><span>Claim #${escapeHtml(claim.id)}</span><time>${formatRelative(claim.updatedAt || claim.createdAt)}</time>`;
  $("currentClaimButton").textContent = "View Claim →";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  $("currentClaimButton").onclick = () => showDashboardView("claims");
}

function pickDashboardClaim(claims) {
  if (!claims.length) return null;
<<<<<<< HEAD
  const sorted = [...claims].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  if (currentUser?.role === "CLAIMANT") return sorted[0];
  const actionable = sorted.find((c) => actionButtons(c).trim());
=======
  const sorted = [...claims].sort((a,b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  if (currentUser?.role === "CLAIMANT") return sorted[0];
  const actionable = sorted.find(c => actionButtons(c).trim());
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  return actionable || sorted[0];
}

function dashboardJourney(status) {
  const steps = ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"];
  if (status === "REJECTED" || status === "FRAUD_REVIEW") {
<<<<<<< HEAD
    return steps.map((s, i) => `<div class="journey-step ${i === 0 ? "done" : ""}"><span>${i === 0 ? "✓" : "○"}</span><small>${prettyStatus(s)}</small></div>`).join("") +
      `<div class="journey-step current"><span>!</span><small>${prettyStatus(status)}</small></div>`;
=======
    return steps.map((s, i) => `<div class="journey-step ${i === 0 ? "done" : ""}"><span>${i === 0 ? "✓" : "○"}</span><small>${prettyStatus(s)}</small></div>`).join("") + `<div class="journey-step current"><span>!</span><small>${prettyStatus(status)}</small></div>`;
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  }
  const index = steps.indexOf(status);
  return steps.map((s, i) => `<div class="journey-step ${i < index ? "done" : ""} ${i === index ? "current" : ""}"><span>${i <= index ? "✓" : "○"}</span><small>${prettyStatus(s)}</small></div>`).join("");
}

function emptyJourney() {
  return ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"].map(s => `<div class="journey-step"><span>○</span><small>${prettyStatus(s)}</small></div>`).join("");
}

function nextWorkflowStep(status) {
  const steps = ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"];
  const index = steps.indexOf(status);
  return index >= 0 && index < steps.length - 1 ? steps[index + 1] : null;
}

<<<<<<< HEAD
=======
function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function formatRelative(value) {
  if (!value) return "";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
function updateStats(claims) {
  if (!Array.isArray(claims)) claims = [];
  if ($("statTotal")) $("statTotal").textContent = claims.length;
  if ($("statPending")) $("statPending").textContent = claims.filter(c => ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "FRAUD_REVIEW"].includes(c.status)).length;
  if ($("statApproved")) $("statApproved").textContent = claims.filter(c => c.status === "APPROVED").length;
  if ($("statSettled")) {
    const settledClaims = claims.filter(c => c.status === "SETTLED");
    const totalAmount = settledClaims.reduce((sum, c) => sum + Number(c.settlementAmount ?? c.amount ?? 0), 0);
<<<<<<< HEAD
    $("statSettled").textContent = totalAmount >= 100000
      ? `₹${(totalAmount / 100000).toFixed(1)}L`
=======
    $("statSettled").textContent = totalAmount >= 100000 
      ? `₹${(totalAmount / 100000).toFixed(1)}L` 
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
      : `₹${totalAmount.toLocaleString("en-IN")}`;
  }
}

function workflowSteps(status) {
  const steps = ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"];
<<<<<<< HEAD
  if (status === "REJECTED" || status === "FRAUD_REVIEW") {
    return steps.map(s => `<span class="step ${s === status ? "current" : ""} ${steps.indexOf(s) < steps.indexOf(status) ? "done" : ""}">${prettyStatus(s)}</span>`).join("") +
      `<span class="step current">${prettyStatus(status)}</span>`;
  }
  const idx = steps.indexOf(status);
  return steps.map((s, i) => `<span class="step ${i === idx ? "current" : ""} ${i < idx ? "done" : ""}">${prettyStatus(s)}</span>`).join("");
=======
  if (status === "REJECTED" || status === "FRAUD_REVIEW") return steps.map(s => `<span class="step ${s===status?'current':''} ${steps.indexOf(s) < steps.indexOf(status) ? 'done':''}">${prettyStatus(s)}</span>`).join("") + `<span class="step current">${prettyStatus(status)}</span>`;
  const idx = steps.indexOf(status); return steps.map((s,i) => `<span class="step ${i===idx?'current':''} ${i<idx?'done':''}">${prettyStatus(s)}</span>`).join("");
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
}

function actionButtons(c) {
  if (!currentUser || currentUser.role === "CLAIMANT") return "";
  const buttons = [];
<<<<<<< HEAD
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "SUBMITTED") {
    buttons.push(btn(c.id, "verify", "Verify Policy & Documents"));
  }
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "FRAUD_REVIEW") {
    buttons.push(btn(c.id, "fraud-clear", "Clear Fraud Hold"));
  }
  if ((currentUser.role === "SURVEYOR" || currentUser.role === "ADMIN") && c.status === "VERIFIED") {
    buttons.push(btn(c.id, "survey", "Complete Inspection Survey"));
  }
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "SURVEY_COMPLETED") {
    buttons.push(btn(c.id, "approve", "Approve Claim", "success"));
  }
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && !["SETTLED", "REJECTED"].includes(c.status)) {
    buttons.push(btn(c.id, "reject", "Reject Claim", "danger"));
  }
  if ((currentUser.role === "FINANCE_OFFICER" || currentUser.role === "ADMIN") && c.status === "APPROVED") {
    buttons.push(btn(c.id, "settle", "Execute Payment Disbursal", "success"));
  }
  return buttons.length ? `<div class="actions">${buttons.join("")}</div>` : "";
}

function btn(id, action, text, cls = "") {
  return `<button type="button" class="${cls}" data-id="${id}" data-action="${action}">${text}</button>`;
}

/* =========================================================
   ACTION CONFIRMATION MODAL & AUDIT LOGS
   ========================================================= */
const CLAIM_ACTIONS = {
  verify: { title: "Verify Claim", confirm: "Confirm Verification", message: "Confirm that the policy and supporting evidence have passed preliminary officer checks.", tone: "primary", icon: "🛡️" },
  reject: { title: "Reject Claim", confirm: "Confirm Rejection", message: "This will permanently move the claim to REJECTED. Proceed only if the policy terms or damage proofs fail review.", tone: "danger", icon: "⚠️" },
  survey: { title: "Complete Survey", confirm: "Submit Survey Assessment", message: "Confirm that the on-site / physical surveyor inspection has been successfully conducted.", tone: "primary", icon: "📋" },
  approve: { title: "Approve Claim", confirm: "Approve for Settlement", message: "Confirm that this claim has cleared all risk criteria and is authorized for financial settlement.", tone: "success", icon: "✅" },
  settle: { title: "Payment Settlement", confirm: "Authorize Disbursal", message: "Verify payment details and authorize final fund transfer to the claimant account.", tone: "success", icon: "₹" },
  "fraud-clear": { title: "Clear Fraud Hold", confirm: "Clear Fraud Flag", message: "Confirm that fraud investigation has concluded and this claim is cleared for standard processing.", tone: "primary", icon: "🔓" }
=======
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "SUBMITTED") buttons.push(btn(c.id,"verify","Verify"));
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "FRAUD_REVIEW") buttons.push(btn(c.id,"fraud-clear","Clear Fraud Review"));
  if ((currentUser.role === "SURVEYOR" || currentUser.role === "ADMIN") && c.status === "VERIFIED") buttons.push(btn(c.id,"survey","Complete Survey"));
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && c.status === "SURVEY_COMPLETED") buttons.push(btn(c.id,"approve","Approve","success"));
  if ((currentUser.role === "CLAIM_OFFICER" || currentUser.role === "ADMIN") && !["SETTLED","REJECTED"].includes(c.status)) buttons.push(btn(c.id,"reject","Reject","danger"));
  if ((currentUser.role === "FINANCE_OFFICER" || currentUser.role === "ADMIN") && c.status === "APPROVED") buttons.push(btn(c.id,"settle","Settle Payment","success"));
  return buttons.length ? `<div class="actions">${buttons.join("")}</div>` : "";
}
function btn(id, action, text, cls="") { return `<button type="button" class="${cls}" data-id="${id}" data-action="${action}">${text}</button>`; }

const CLAIM_ACTIONS = {
  verify: { title: "Verify Claim", confirm: "Verify Claim", message: "Confirm that the policy and supporting documents have been checked.", tone: "primary" },
  reject: { title: "Reject Claim", confirm: "Reject Claim", message: "This will permanently move the claim to REJECTED. Continue only if the claim should be rejected.", tone: "danger" },
  survey: { title: "Complete Survey", confirm: "Complete Survey", message: "Confirm that the survey/inspection for this claim has been completed.", tone: "primary" },
  approve: { title: "Approve Claim", confirm: "Approve Claim", message: "Confirm that the claim has passed the required review and can move to APPROVED.", tone: "success" },
  settle: { title: "Payment Settlement", confirm: "Confirm Settlement", message: "Enter the payment details below and confirm that the approved claim has been settled.", tone: "success" }
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
};
let pendingClaimAction = null;

function openActionModal(id, action) {
  const config = CLAIM_ACTIONS[action];
  if (!config) return;
  const claim = window.__claims?.find(c => Number(c.id) === Number(id));
  if (!claim) return;

  pendingClaimAction = { id: Number(id), action };
  $("actionModalTitle").textContent = config.title;
<<<<<<< HEAD
  $("actionModalClaim").textContent = `Claim #CLM-${claim.id} • ${claim.claimantName} • Policy ${claim.policyNumber}`;
  $("actionModalMessage").textContent = config.message;
  $("actionModalNote").value = "";

  const iconEl = $("actionModalIcon");
  if (iconEl) iconEl.textContent = config.icon || "!";

  const confirm = $("actionConfirmBtn");
  confirm.disabled = false;
  confirm.textContent = config.confirm;
  confirm.className = `modal-confirm btn ${config.tone === "danger" ? "danger" : (config.tone === "success" ? "success" : "btn-primary")}`;
=======
  $("actionModalClaim").textContent = `Claim #${claim.id} • ${claim.claimantName} • ${claim.policyNumber}`;
  $("actionModalMessage").textContent = config.message;
  $("actionModalNote").value = "";

  const confirm = $("actionConfirmBtn");
  confirm.disabled = false;
  confirm.textContent = config.confirm;
  confirm.className = `modal-confirm ${config.tone}`;
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0

  const settlementFields = $("settlementFields");
  const isSettlement = action === "settle";
  settlementFields.classList.toggle("hidden", !isSettlement);

  if (isSettlement) {
    $("paymentMethod").value = "";
    $("settlementAmount").value = Number(claim.amount).toFixed(2);
    $("transactionReference").value = "";
<<<<<<< HEAD
=======
  } else {
    $("paymentMethod").value = "";
    $("settlementAmount").value = "";
    $("transactionReference").value = "";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  }

  $("actionModal").classList.remove("hidden");

  setTimeout(() => {
    if (isSettlement) {
      $("paymentMethod").focus();
    } else {
      $("actionModalNote").focus();
    }
  }, 50);
}

function closeActionModal() {
  pendingClaimAction = null;
  const confirm = $("actionConfirmBtn");
  confirm.disabled = false;
  confirm.textContent = "Confirm";
<<<<<<< HEAD
=======
  confirm.className = "modal-confirm primary";
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  $("actionModal").classList.add("hidden");
  $("actionModalNote").value = "";
  $("paymentMethod").value = "";
  $("settlementAmount").value = "";
  $("transactionReference").value = "";
  $("settlementFields").classList.add("hidden");
}

async function confirmClaimAction() {
  if (!pendingClaimAction) return;

  const { id, action } = pendingClaimAction;
  const config = CLAIM_ACTIONS[action];
  const confirm = $("actionConfirmBtn");
  const note = $("actionModalNote").value.trim();

  const payload = { note };

  if (action === "settle") {
    const paymentMethod = $("paymentMethod").value;
    const transactionReference = $("transactionReference").value.trim();
    const amountValue = $("settlementAmount").value;
    const amount = Number(amountValue);

    if (!paymentMethod) {
      alert("Please select a payment method.");
      $("paymentMethod").focus();
      return;
    }

    if (!amountValue || !Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid settlement amount.");
      $("settlementAmount").focus();
      return;
    }

    if (!transactionReference) {
      alert("Please enter the transaction/reference number.");
      $("transactionReference").focus();
      return;
    }

    payload.paymentMethod = paymentMethod;
    payload.transactionReference = transactionReference;
    payload.amount = amount;
  }

  confirm.disabled = true;
  confirm.textContent = "Processing...";

  try {
    const response = await fetch(`${API}/claims/${id}/${action}`, {
      method: "POST",
<<<<<<< HEAD
      headers: { ...headers(), "Content-Type": "application/json" },
=======
      headers: {...headers(), "Content-Type":"application/json"},
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
      body: JSON.stringify(payload)
    });

    const data = await json(response);
<<<<<<< HEAD
=======

>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
    if (!response.ok) {
      throw new Error(data.message || `${config.title} failed`);
    }

    closeActionModal();

    showToast(
      action === "settle"
<<<<<<< HEAD
        ? `Claim #${id} settled successfully!`
=======
        ? `Claim #${id} settled successfully.`
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
        : `Claim #${id}: ${prettyStatus(data.status)}`
    );

    await loadClaims();
<<<<<<< HEAD
=======

>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  } catch (e) {
    confirm.disabled = false;
    confirm.textContent = config.confirm;
    alert(e.message);
  }
}

<<<<<<< HEAD
async function toggleHistory(id) {
  const box = $(`history-${id}`);
  if (box.innerHTML.trim()) {
    box.innerHTML = "";
    return;
  }
  try {
    const response = await fetch(`${API}/claims/${id}/history`, { headers: headers() });
    const events = await json(response);
    box.innerHTML = events
      .map((e) => `<div class="history-item"><b>${formatDate(e.eventTime)}</b> — <span>${escapeHtml(e.action)}</span> by <strong>${escapeHtml(e.actor)}</strong>${e.note ? ` <br><small>“${escapeHtml(e.note)}”</small>` : ""}</div>`)
      .join("");
  } catch (err) {
    box.innerHTML = `<div class="history-item" style="color:var(--rose)">Failed to load audit history.</div>`;
  }
}

/* =========================================================
   USER MANAGEMENT (ADMIN ONLY)
   ========================================================= */
async function createUser(event) {
  event.preventDefault();
  $("userMessage").style.color = "var(--primary)";
  $("userMessage").textContent = "Creating staff account and sending activation OTP...";
  const body = {
    fullName: $("newFullName").value.trim(),
    email: $("newEmail").value.trim(),
    username: $("newUsername").value.trim(),
    password: $("newPassword").value,
    role: $("newRole").value
  };
  try {
    const r = await fetch(`${API}/admin/users?admin=${encodeURIComponent(currentUser.username)}`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const d = await json(r);
    if (!r.ok) throw new Error(d.message || "Could not create staff account");
    $("userMessage").style.color = "var(--emerald)";
    $("userMessage").textContent = d.message || "Staff account created successfully.";
    $("userForm").reset();
    showToast(`Staff account ${body.username} provisioned.`);
    await loadUsers();
  } catch (e) {
    $("userMessage").style.color = "var(--rose)";
    $("userMessage").textContent = e.message;
  }
}

async function loadUsers() {
  if (!currentUser || currentUser.role !== "ADMIN") return;
  try {
    const r = await fetch(`${API}/admin/users?admin=${encodeURIComponent(currentUser.username)}`, { headers: headers() });
    const users = await json(r);
    if (!r.ok) throw new Error(users.message || "Could not load staff directory");
    $("usersList").innerHTML = users
      .map(
        (u) => `
        <div class="user-row">
          <div>
            <b>${escapeHtml(u.fullName || u.username)}</b>
            <span>${escapeHtml(u.email)} • @${escapeHtml(u.username)} • <strong>${prettyRole(u.role)}</strong></span>
          </div>
          <div>
            <span class="user-status ${u.enabled ? "active" : "inactive"}">${u.enabled ? "ACTIVE" : (u.emailVerified ? "INACTIVE" : "OTP PENDING")}</span>
            ${u.role !== "ADMIN" ? `<button class="small ${u.enabled ? "danger" : "success"}" data-user-id="${u.id}" data-enabled="${u.enabled}">${u.enabled ? "Deactivate" : "Activate"}</button>` : ""}
          </div>
        </div>`
      )
      .join("");

    document.querySelectorAll("[data-user-id]").forEach((b) => {
      b.addEventListener("click", () => toggleUser(Number(b.dataset.userId), b.dataset.enabled !== "true"));
    });
  } catch (e) {
    $("usersList").innerHTML = `<div class="empty">${escapeHtml(e.message)}</div>`;
  }
}

async function toggleUser(id, enable) {
  try {
    const r = await fetch(`${API}/admin/users/${id}/${enable ? "enable" : "disable"}?admin=${encodeURIComponent(currentUser.username)}`, {
      method: "POST",
      headers: headers()
    });
    const d = await json(r);
    if (!r.ok) throw new Error(d.message || "Operation failed");
    showToast(`User account status updated.`);
    await loadUsers();
  } catch (e) {
    alert(e.message);
  }
}

/* =========================================================
   HELPERS & UTILITIES
   ========================================================= */
function paymentMethodLabel(method) {
  const labels = {
    BANK_TRANSFER: "Bank Transfer (NEFT/RTGS)",
    UPI: "Instant UPI",
    CHEQUE: "Corporate Cheque"
=======

async function toggleHistory(id) {
  const box = $(`history-${id}`); if (box.innerHTML.trim()) { box.innerHTML=""; return; }
  const response=await fetch(`${API}/claims/${id}/history`,{headers:headers()}); const events=await json(response); box.innerHTML=events.map(e=>`<div class="history-item"><b>${formatDate(e.eventTime)}</b> — ${escapeHtml(e.action)} by ${escapeHtml(e.actor)}${e.note?` — ${escapeHtml(e.note)}`:""}</div>`).join("");
}

async function createUser(event) {
  event.preventDefault(); $("userMessage").textContent="Creating account and sending OTP...";
  const body={fullName:$("newFullName").value.trim(),email:$("newEmail").value.trim(),username:$("newUsername").value.trim(),password:$("newPassword").value,role:$("newRole").value};
  try { const r=await fetch(`${API}/admin/users?admin=${encodeURIComponent(currentUser.username)}`,{method:"POST",headers:{...headers(),"Content-Type":"application/json"},body:JSON.stringify(body)}); const d=await json(r); if(!r.ok) throw new Error(d.message||"Could not create account"); $("userMessage").textContent=d.message; $("userForm").reset(); await loadUsers(); }
  catch(e){ $("userMessage").textContent=e.message; }
}

async function loadUsers() {
  if(!currentUser || currentUser.role!=="ADMIN") return;
  try { const r=await fetch(`${API}/admin/users?admin=${encodeURIComponent(currentUser.username)}`,{headers:headers()}); const users=await json(r); if(!r.ok) throw new Error(users.message||"Could not load users"); $("usersList").innerHTML=users.map(u=>`<div class="user-row"><div><b>${escapeHtml(u.fullName)}</b><span>${escapeHtml(u.email)} • ${escapeHtml(u.username)} • ${prettyRole(u.role)}</span></div><div><span class="user-status ${u.enabled?'active':'inactive'}">${u.enabled?'ACTIVE':(u.emailVerified?'INACTIVE':'OTP PENDING')}</span>${u.role!=="ADMIN"?`<button class="small ${u.enabled?'danger':'success'}" data-user-id="${u.id}" data-enabled="${u.enabled}">${u.enabled?'Deactivate':'Enable'}</button>`:""}</div></div>`).join(""); document.querySelectorAll("[data-user-id]").forEach(b=>b.addEventListener("click",()=>toggleUser(Number(b.dataset.userId),b.dataset.enabled!=="true"))); }
  catch(e){ $("usersList").innerHTML=`<div class="empty">${escapeHtml(e.message)}</div>`; }
}
async function toggleUser(id, enable){ try { const r=await fetch(`${API}/admin/users/${id}/${enable?'enable':'disable'}?admin=${encodeURIComponent(currentUser.username)}`,{method:"POST",headers:headers()}); const d=await json(r); if(!r.ok) throw new Error(d.message||"Operation failed"); await loadUsers(); } catch(e){ alert(e.message); } }

function paymentMethodLabel(method) {
  const labels = {
    BANK_TRANSFER: "Bank Transfer",
    UPI: "UPI",
    CHEQUE: "Cheque"
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
  };
  return labels[method] || method || "-";
}

<<<<<<< HEAD
function prettyRole(role) {
  return String(role || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function prettyStatus(status) {
  return String(status || "").replaceAll("_", " ");
}

function statusClass(status) {
  return String(status || "").toLowerCase().replaceAll("_", "-");
}

function formatDate(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return String(v);
  }
}

function formatRelative(value) {
  if (!value) return "";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

let toastTimer = null;
function showToast(message) {
  const toast = $("toast");
  const msgEl = $("toastMessage");
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3800);
}

async function json(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function escapeHtml(v) {
  return String(v ?? "").replace(/[&<>'"]/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[ch]));
}

// Initialize theme on DOM ready
document.addEventListener("DOMContentLoaded", initTheme);
if (document.readyState !== "loading") {
  initTheme();
}
=======
function prettyRole(role){return role.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}
function prettyStatus(status){return status.replaceAll("_"," ")}
function statusClass(status){return status.toLowerCase().replaceAll("_","-")}
function formatDate(v){return v?new Date(v).toLocaleString():"-"}
function showToast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");setTimeout(()=>$("toast").classList.add("hidden"),3500)}
async function json(response){try{return await response.json()}catch{return{}}}
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
