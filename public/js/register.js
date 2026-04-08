/* ============================================================
   ARCHITECT — REGISTER API CLIENT
   Replace BASE_URL with your backend.
   ============================================================ */
const AUTH_API = (() => {
  const BASE_URL = "http://localhost:3000/api/v1";

  return {
    register: (name, email, password) =>
      fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }).then(async (res) => {
        const data = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(data.message || "Registration failed");
        return data; // expects { token, user }
      }),

    // registerWithGoogle: () => {
    //   window.location.href = `${BASE_URL}/auth/google`;
    // },

    // checkEmailAvailable: (email) =>
    //   fetch(`${BASE_URL}/auth/check-email`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email }),
    //   }).then((res) => res.json()), // expects { available: bool }
  };
})();

/* ============================================================
   PASSWORD STRENGTH
   ============================================================ */
/*const strengthLevels = [
        { max: 0, label: "", color: "var(--outline-variant)", width: "0%" },
        { max: 1, label: "Weak", color: "#a83836", width: "25%" },
        { max: 2, label: "Fair", color: "#f59e0b", width: "50%" },
        { max: 3, label: "Good", color: "#0ea5e9", width: "75%" },
        { max: 99, label: "Strong", color: "#198754", width: "100%" },
      ];

      function calcStrength(pw) {
        let score = 0;
        if (pw.length >= 8) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
      }

      document
        .getElementById("password")
        .addEventListener("input", function () {
          const score = calcStrength(this.value);
          const level = strengthLevels.find((l) => score <= l.max);
          const bar = document.getElementById("pw-strength");
          bar.style.width = level.width;
          bar.style.background = level.color;
          document.getElementById("pw-strength-label").textContent =
            level.label;
          document.getElementById("pw-strength-label").style.color =
            level.color;
        });*/

/* ============================================================
   TOGGLE PASSWORD VISIBILITY
   ============================================================ */
document.getElementById("toggle-pw").addEventListener("click", () => {
  const pw = document.getElementById("password");
  const show = pw.type === "password";
  pw.type = show ? "text" : "password";
  document.getElementById("pw-icon").textContent = show
    ? "visibility_off"
    : "visibility";
});

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */
function showErr(id, condition) {
  document.getElementById(id).classList.toggle("show", condition);
  return condition;
}

/* ============================================================
   REGISTER SUBMIT
   ============================================================ */
document.getElementById("register-btn").addEventListener("click", async () => {
  const name = document.getElementById("full_name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const regError = document.getElementById("reg-error");

  regError.style.display = "none";

  const hasErrors = [
    showErr("name-error", name.length < 2),
    showErr("email-error", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    showErr("password-error", password.length < 8),
  ].some(Boolean);

  if (hasErrors) return;

  setLoading(true);
  try {
    await AUTH_API.register(name, email, password);
    // localStorage.setItem("architect_token", data.token);
    // localStorage.setItem("architect_user", JSON.stringify(data.user));
    window.location.href = "login.html";
  } catch (err) {
    regError.textContent =
      err.message || "Something went wrong. Please try again.";
    regError.style.display = "block";
  } finally {
    setLoading(false);
  }
});

// Allow Enter
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("register-btn").click();
});

// Google
// document
//   .getElementById("google-register-btn")
//   .addEventListener("click", () => AUTH_API.registerWithGoogle());

function setLoading(on) {
  const btn = document.getElementById("register-btn");
  btn.disabled = on;
  document.getElementById("reg-spinner").classList.toggle("d-none", !on);
  document.getElementById("reg-arrow").classList.toggle("d-none", on);
}
