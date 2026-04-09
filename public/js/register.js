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
  };
})();

document.getElementById("toggle-pw").addEventListener("click", () => {
  const pw = document.getElementById("password");
  const show = pw.type === "password";
  pw.type = show ? "text" : "password";
  document.getElementById("pw-icon").textContent = show
    ? "visibility_off"
    : "visibility";
});

function showErr(id, condition) {
  document.getElementById(id).classList.toggle("show", condition);
  return condition;
}

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

function setLoading(on) {
  const btn = document.getElementById("register-btn");
  btn.disabled = on;
  document.getElementById("reg-spinner").classList.toggle("d-none", !on);
  document.getElementById("reg-arrow").classList.toggle("d-none", on);
}
