/* ============================================================
   ARCHITECT — AUTH API CLIENT
   Replace BASE_URL with your backend.
   ============================================================ */
const AUTH_API = (() => {
  const BASE_URL = "http://localhost:3000/api/v1"; // ← change this

  return {
    login: (email, password) =>
      fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        return data; // expects { token, user }
      }),

    // loginWithGoogle: () => {
    //   // Redirect to OAuth flow or open popup
    //   window.location.href = `${BASE_URL}/auth/google`;
    // },

    // SSO / SAML
    // loginWithSSO: (domain) =>
    //   fetch(`${BASE_URL}/auth/sso`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ domain }),
    //   }).then((res) => res.json()),
  };
})();

/* ============================================================
   FORM LOGIC
   ============================================================ */
const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const spinner = document.getElementById("login-spinner");
const arrow = document.getElementById("login-arrow");

// Toggle password visibility
document.getElementById("toggle-pw").addEventListener("click", () => {
  const show = passwordEl.type === "password";
  passwordEl.type = show ? "text" : "password";
  document.getElementById("pw-icon").textContent = show
    ? "visibility_off"
    : "visibility";
});

// Inline validation
emailEl.addEventListener("blur", () => {
  const err = document.getElementById("email-error");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value);
  err.classList.toggle("show", !valid && emailEl.value.length > 0);
});
passwordEl.addEventListener("blur", () => {
  const err = document.getElementById("password-error");
  err.classList.toggle("show", passwordEl.value.length === 0);
});

// Login submit
loginBtn.addEventListener("click", async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  loginError.style.display = "none";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passOk = password.length > 0;
  document.getElementById("email-error").classList.toggle("show", !emailOk);
  document.getElementById("password-error").classList.toggle("show", !passOk);
  if (!emailOk || !passOk) return;

  setLoading(true);
  try {
    await AUTH_API.login(email, password);

    window.location.href = "boards.html";
  } catch (err) {
    loginError.textContent =
      err.message || "Invalid credentials. Please try again.";
    loginError.style.display = "block";
  } finally {
    setLoading(false);
  }
});

// Allow Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

// Google login
// document
//   .getElementById("google-login-btn")
//   .addEventListener("click", () => AUTH_API.loginWithGoogle());

function setLoading(on) {
  loginBtn.disabled = on;
  spinner.classList.toggle("d-none", !on);
  arrow.classList.toggle("d-none", on);
}

// If already logged in, redirect
// if (localStorage.getItem("architect_token")) {
//   window.location.href = "dashboard.html";
// }
