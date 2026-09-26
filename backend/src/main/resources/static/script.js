const API = window.location.protocol === "file:" ? "http://localhost:8080/api" : `${window.location.origin}/api`;
let currentUser = null;
let eventSource = null;
const $ = (id) => document.getElementById(id);

// Separate authentication screens: Login, Email Verification and Claimant Registration.
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
$("actionModal").addEventListener("click", (e) => { if (e.target === $("actionModal")) closeActionModal(); });

function switchAuthView(panelId) {
  ["loginPanel", "forgotPanel", "resetPasswordPanel", "verifyPanel", "registerPanel"].forEach((id) => $(id).classList.toggle("hidden", id !== panelId));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === panelId));
  $("loginMessage").textContent = "";
  $("otpMessage").textContent = "";
  $("registerMessage").textContent = "";
  if ($("forgotMessage")) $("forgotMessage").textContent = "";
  if ($("resetMessage")) $("resetMessage").textContent = "";
}

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
  const body = {
    fullName: $("regFullName").value.trim(),
    email: $("regEmail").value.trim(),
    username: $("regUsername").value.trim(),
    password: $("regPassword").value
  };
  try {
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
    $("registerMessage").textContent = e.message;
  }
}

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
}

async function forgotPassword() {
  const email = $("forgotEmail").value.trim();
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
}

async function resetPassword() {
  const email = $("resetEmail").value.trim();
  const otp = $("resetOtp").value.trim();
  const newPassword = $("resetNewPassword").value;
  const confirmPassword = $("resetConfirmPassword").value;
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
}

async function changePassword() {
  const currentPassword = $("currentPassword").value;
  const newPassword = $("newPasswordChange").value;
  const confirmPassword = $("confirmPasswordChange").value;
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

function showDashboard() {
  $("authView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
  const role = currentUser.role;
  const roleName = prettyRole(role);
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
}

function buildQuickActions() {
  const actions = [];
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
  if (view === "users") loadUsers();
  if (view === "claims") loadClaims();
  if (view === "overview") renderOverview(window.__claims || []);
}

async function logout() {
  try { await fetch(`${API}/auth/logout`, { method: "POST", headers: headers() }); } catch {}
  if (eventSource) eventSource.close(); eventSource = null; currentUser = null;
  $("dashboardView").classList.add("hidden"); $("authView").classList.remove("hidden"); $("liveBadge").classList.add("hidden"); switchAuthView("loginPanel");
}

function connectRealtime() {
  if (eventSource) eventSource.close();
  eventSource = new EventSource(`${API}/events?username=${encodeURIComponent(currentUser.username)}`);
  eventSource.addEventListener("connected", () => $("liveBadge").classList.remove("hidden"));
  eventSource.addEventListener("claim-update", async (event) => { const claim = JSON.parse(event.data); showToast(`Claim #${claim.id} updated to ${prettyStatus(claim.status)}`); await loadClaims(); });
  eventSource.onerror = () => $("liveBadge").classList.add("hidden");
}

async function submitClaim(event) {
  event.preventDefault(); const file = $("document").files[0]; if (!file) return;
  const form = new FormData(); form.append("username", currentUser.username); form.append("policyNumber", $("policyNumber").value.trim()); form.append("amount", $("amount").value); form.append("description", $("description").value.trim()); form.append("document", file);
  $("submitMessage").textContent = "Submitting...";
  try { const response = await fetch(`${API}/claims`, { method: "POST", headers: headers(), body: form }); const data = await json(response); if (!response.ok) throw new Error(data.message || "Claim submission failed"); $("submitMessage").textContent = `Claim #${data.id} submitted successfully.`; $("claimForm").reset(); await loadClaims(); }
  catch (e) { $("submitMessage").textContent = e.message; }
}

async function loadClaims() {
  if (!currentUser) return;
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
          ${c.status === "SETTLED"
            ? `
              <div class="payment-grid">
                <div><span>Method</span><strong>${escapeHtml(paymentMethodLabel(c.paymentMethod))}</strong></div>
                <div><span>Settlement Amount</span><strong>₹${Number(c.settlementAmount ?? c.amount).toLocaleString("en-IN", {minimumFractionDigits:2})}</strong></div>
                <div><span>Reference</span><strong>${escapeHtml(c.transactionReference || "-")}</strong></div>
                <div><span>Settled On</span><strong>${formatDate(c.settlementDate)}</strong></div>
              </div>`
            : `<div class="payment-pending">Approved amount: <strong>₹${Number(c.amount).toLocaleString("en-IN", {minimumFractionDigits:2})}</strong> — awaiting Finance Officer settlement.</div>`}
        </div>`
      : "";

    return `
      <article class="claim-card">
        <div class="claim-top">
          <h4>Claim #${c.id}</h4>
          <span class="status ${statusClass(c.status)}">${prettyStatus(c.status)}</span>
        </div>
        <div class="meta">
          <div><b>Claimant:</b> ${escapeHtml(c.claimantName)}</div>
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


function renderOverview(claims) {
  const visible = Array.isArray(claims) ? claims : [];
  const claim = pickDashboardClaim(visible);
  $("glanceCount").textContent = `${visible.length} ${visible.length === 1 ? "claim" : "claims"}`;
  if (!claim) {
    $("currentClaimTitle").textContent = "No active claim";
    $("currentClaimStatus").textContent = "—";
    $("currentClaimStatus").className = "status status-muted";
    $("currentPolicy").textContent = "—";
    $("currentAmount").textContent = "—";
    $("currentIncident").textContent = "—";
    $("journeyCurrentText").textContent = "Submit a claim to begin your journey.";
    $("journeyNextText").textContent = "";
    $("claimJourney").innerHTML = emptyJourney();
    $("recentUpdate").textContent = "No recent update.";
    $("glanceText").textContent = currentUser?.role === "CLAIMANT" ? "Your submitted claims will appear here." : "Claims requiring your role will appear here.";
    $("currentClaimButton").textContent = currentUser?.role === "CLAIMANT" ? "Submit a Claim →" : "Open Claims →";
    $("currentClaimButton").onclick = () => showDashboardView(currentUser?.role === "CLAIMANT" ? "claim" : "claims");
    return;
  }
  $("currentClaimTitle").textContent = `Claim #${claim.id}`;
  $("currentClaimStatus").textContent = prettyStatus(claim.status);
  $("currentClaimStatus").className = `status ${statusClass(claim.status)}`;
  $("currentPolicy").textContent = claim.policyNumber || "—";
  $("currentAmount").textContent = `₹${Number(claim.amount || 0).toLocaleString("en-IN")}`;
  $("currentIncident").textContent = claim.incidentType || "Insurance claim";
  $("claimJourney").innerHTML = dashboardJourney(claim.status);
  const next = nextWorkflowStep(claim.status);
  $("journeyCurrentText").textContent = `Current stage: ${prettyStatus(claim.status)}`;
  $("journeyNextText").textContent = next ? `Next: ${prettyStatus(next)}` : "Journey complete";
  $("glanceText").textContent = claim.description ? truncate(claim.description, 90) : `Last updated ${formatRelative(claim.updatedAt || claim.createdAt)}.`;
  $("recentUpdate").innerHTML = `<b>${escapeHtml(prettyStatus(claim.status))}</b><span>Claim #${escapeHtml(claim.id)}</span><time>${formatRelative(claim.updatedAt || claim.createdAt)}</time>`;
  $("currentClaimButton").textContent = "View Claim →";
  $("currentClaimButton").onclick = () => showDashboardView("claims");
}

function pickDashboardClaim(claims) {
  if (!claims.length) return null;
  const sorted = [...claims].sort((a,b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  if (currentUser?.role === "CLAIMANT") return sorted[0];
  const actionable = sorted.find(c => actionButtons(c).trim());
  return actionable || sorted[0];
}

function dashboardJourney(status) {
  const steps = ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"];
  if (status === "REJECTED" || status === "FRAUD_REVIEW") {
    return steps.map((s, i) => `<div class="journey-step ${i === 0 ? "done" : ""}"><span>${i === 0 ? "✓" : "○"}</span><small>${prettyStatus(s)}</small></div>`).join("") + `<div class="journey-step current"><span>!</span><small>${prettyStatus(status)}</small></div>`;
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

function updateStats(claims) {
  if (!Array.isArray(claims)) claims = [];
  if ($("statTotal")) $("statTotal").textContent = claims.length;
  if ($("statPending")) $("statPending").textContent = claims.filter(c => ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "FRAUD_REVIEW"].includes(c.status)).length;
  if ($("statApproved")) $("statApproved").textContent = claims.filter(c => c.status === "APPROVED").length;
  if ($("statSettled")) {
    const settledClaims = claims.filter(c => c.status === "SETTLED");
    const totalAmount = settledClaims.reduce((sum, c) => sum + Number(c.settlementAmount ?? c.amount ?? 0), 0);
    $("statSettled").textContent = totalAmount >= 100000 
      ? `₹${(totalAmount / 100000).toFixed(1)}L` 
      : `₹${totalAmount.toLocaleString("en-IN")}`;
  }
}

function workflowSteps(status) {
  const steps = ["SUBMITTED", "VERIFIED", "SURVEY_COMPLETED", "APPROVED", "SETTLED"];
  if (status === "REJECTED" || status === "FRAUD_REVIEW") return steps.map(s => `<span class="step ${s===status?'current':''} ${steps.indexOf(s) < steps.indexOf(status) ? 'done':''}">${prettyStatus(s)}</span>`).join("") + `<span class="step current">${prettyStatus(status)}</span>`;
  const idx = steps.indexOf(status); return steps.map((s,i) => `<span class="step ${i===idx?'current':''} ${i<idx?'done':''}">${prettyStatus(s)}</span>`).join("");
}

function actionButtons(c) {
  if (!currentUser || currentUser.role === "CLAIMANT") return "";
  const buttons = [];
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
};
let pendingClaimAction = null;

function openActionModal(id, action) {
  const config = CLAIM_ACTIONS[action];
  if (!config) return;
  const claim = window.__claims?.find(c => Number(c.id) === Number(id));
  if (!claim) return;

  pendingClaimAction = { id: Number(id), action };
  $("actionModalTitle").textContent = config.title;
  $("actionModalClaim").textContent = `Claim #${claim.id} • ${claim.claimantName} • ${claim.policyNumber}`;
  $("actionModalMessage").textContent = config.message;
  $("actionModalNote").value = "";

  const confirm = $("actionConfirmBtn");
  confirm.disabled = false;
  confirm.textContent = config.confirm;
  confirm.className = `modal-confirm ${config.tone}`;

  const settlementFields = $("settlementFields");
  const isSettlement = action === "settle";
  settlementFields.classList.toggle("hidden", !isSettlement);

  if (isSettlement) {
    $("paymentMethod").value = "";
    $("settlementAmount").value = Number(claim.amount).toFixed(2);
    $("transactionReference").value = "";
  } else {
    $("paymentMethod").value = "";
    $("settlementAmount").value = "";
    $("transactionReference").value = "";
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
  confirm.className = "modal-confirm primary";
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
      headers: {...headers(), "Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    const data = await json(response);

    if (!response.ok) {
      throw new Error(data.message || `${config.title} failed`);
    }

    closeActionModal();

    showToast(
      action === "settle"
        ? `Claim #${id} settled successfully.`
        : `Claim #${id}: ${prettyStatus(data.status)}`
    );

    await loadClaims();

  } catch (e) {
    confirm.disabled = false;
    confirm.textContent = config.confirm;
    alert(e.message);
  }
}


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
  };
  return labels[method] || method || "-";
}

function prettyRole(role){return role.replaceAll("_"," ").toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())}
function prettyStatus(status){return status.replaceAll("_"," ")}
function statusClass(status){return status.toLowerCase().replaceAll("_","-")}
function formatDate(v){return v?new Date(v).toLocaleString():"-"}
function showToast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");setTimeout(()=>$("toast").classList.add("hidden"),3500)}
async function json(response){try{return await response.json()}catch{return{}}}
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
