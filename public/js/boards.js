/* ============================================================
   ARCHITECT — BOARDS API CLIENT
   Replace BASE_URL with your backend.
   ============================================================ */
const API = (() => {
  const BASE_URL = "http://localhost:3000/api/v1"; // ← change this
  // function getAuthToken() {
  //   return localStorage.getItem("architect_token") || "";
  // }
  async function request(method, path, body = null) {
    const opts = {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  return {
    getBoards: () => request("GET", "/boards"),
    createBoard: (data) => request("POST", "/boards", data),
    deleteBoard: (id) => request("DELETE", `/boards/${id}`),
    // starBoard: (id, star) =>
    //   request("PATCH", `/boards/${id}`, { starred: star }),
    getCurrentUser: () => request("GET", "/users/me"),
  };
})();

/* ============================================================
   MOCK DATA
   ============================================================ */
const MOCK_BOARDS = [
  {
    id: 1,
    name: "Product Launch",
    description: "Q4 product launch coordination and tracking.",
    color: "#0f57d0",
    visibility: "shared",
    starred: true,
    taskCount: 6,
    memberCount: 4,
    updatedAt: "2024-06-20",
  },
  {
    id: 2,
    name: "Design System",
    description: "Component library and token documentation.",
    color: "#7c4dff",
    visibility: "private",
    starred: false,
    taskCount: 12,
    memberCount: 2,
    updatedAt: "2024-06-18",
  },
  {
    id: 3,
    name: "Marketing Q3",
    description: "Campaign planning and content calendar.",
    color: "#e91e63",
    visibility: "shared",
    starred: false,
    taskCount: 8,
    memberCount: 5,
    updatedAt: "2024-06-15",
  },
  {
    id: 4,
    name: "Engineering Sprint",
    description: "Backend infrastructure and API work.",
    color: "#198754",
    visibility: "private",
    starred: true,
    taskCount: 15,
    memberCount: 3,
    updatedAt: "2024-06-21",
  },
];

/* ============================================================
   STATE
   ============================================================ */
const AppState = { boards: [], filter: "all", search: "" };

/* ============================================================
   RENDER
   ============================================================ */
function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

// function filteredBoards() {
//   return AppState.boards.filter((b) => {
//     const matchSearch =
//       b.name.toLowerCase().includes(AppState.search) ||
//       (b.description || "").toLowerCase().includes(AppState.search);
//     const matchFilter =
//       AppState.filter === "all"
//         ? true
//         : AppState.filter === "mine"
//           ? b.visibility === "private"
//           : AppState.filter === "shared"
//             ? b.visibility === "shared"
//             : AppState.filter === "starred"
//               ? b.starred
//               : true;
//     return matchSearch && matchFilter;
//   });
// }

function renderBoards() {
  const grid = document.getElementById("boards-grid");
  const boards = AppState.boards;

  document.getElementById("topbar-subtitle").textContent =
    `${AppState.boards.length} tablero${AppState.boards.length !== 1 ? "s" : ""}`;
  document.getElementById("sidebar-boards-count").textContent =
    AppState.boards.length;

  grid.innerHTML = "";

  if (boards.length === 0) {
    document.getElementById("empty-state").classList.remove("d-none");
    return;
  }
  document.getElementById("empty-state").classList.add("d-none");

  boards.forEach((board) => {
    const col = document.createElement("div");
    col.className = "col-12 ";
    col.innerHTML = `
      <div class="board-card" data-id="${board.id}">
        <div class="accent" style="background:${board.color}"></div>
        <button class="delete-btn" data-id="${board.id}" title="Delete board">
          <span class="material-symbols-outlined" style="font-size:1.1rem">delete</span>
        </button>
        <div class="d-flex align-items-start gap-2 mt-1 mb-2">
          <div style="width:36px;height:36px;border-radius:10px;background:${board.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="material-symbols-outlined" style="font-size:1.15rem;color:${board.color}">dashboard</span>
          </div>
          <div class="flex-grow-1 min-w-0">
            <h5>${board.name}</h5>
            <p class="desc">${board.description || "No description."}</p>
          </div>
          
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="meta"><span class="material-symbols-outlined" style="font-size:.85rem">task_alt</span> ${board.totalTareas} tasks</span>
          <span class="meta"><span class="material-symbols-outlined" style="font-size:.85rem">group</span> 1</span>
          <span class="meta"><span class="material-symbols-outlined" style="font-size:.85rem">${board.visibility === "private" ? "lock" : "people"}</span> ${board.visibility}</span>
          <span class="ms-auto meta">${formatDate(board.updatedAt)}</span>
        </div>
      </div>`;
    grid.appendChild(col);

    // Click card → go to board (not delete/star)
    col.querySelector(".board-card").addEventListener("click", (e) => {
      if (
        e.target.closest(".delete-btn")
        // e.target.closest(".star-btn")
      )
        return;
      window.location.href = `dashboard.html?board=${board.id}`;
    });

    // Delete
    col.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      pendingDeleteId = board.id;
      document.getElementById("delete-modal-name").textContent =
        `"${board.name}" Se eliminará permanentemente.`;
      new bootstrap.Modal(document.getElementById("deleteModal")).show();
    });
  });

  const newCard = document.createElement("div");
  newCard.className = "col-12";
  newCard.innerHTML = `
            <button class="board-new w-100 " id="grid-new-board-btn">
              <div class="icon-wrap"><span class="material-symbols-outlined" style="color:var(--primary)">add</span></div>
              <span style="font-size:.82rem;font-weight:700;color:var(--on-surface-variant)">Nuevo tablero</span>
            </button>`;
  grid.appendChild(newCard);
  document
    .getElementById("grid-new-board-btn")
    .addEventListener("click", openNewBoardModal);
}

/* ============================================================
   LOAD
   ============================================================ */
async function loadUser() {
  try {
    const { user } = await API.getCurrentUser();
    document.getElementById("sidebar-username").textContent = user.name;
    document.getElementById("sidebar-email").textContent = user.email;
    document.getElementById("sidebar-avatar").textContent =
      user.initials || user.name.slice(0, 2).toUpperCase();
  } catch {
    document.getElementById("sidebar-username").textContent = "Jordan Doe";
    document.getElementById("sidebar-email").textContent = "jordan@company.com";
  }
}

async function loadBoards() {
  try {
    AppState.boards = await API.getBoards();
  } catch {
    AppState.boards = MOCK_BOARDS;
    showToast("Using demo data — connect your API.", "warning");
  }
  renderBoards();
}

/* ============================================================
   NEW BOARD
   ============================================================ */
let selectedColor = "#0f57d0";

function openNewBoardModal() {
  document.getElementById("board-name-input").value = "";
  document.getElementById("board-desc-input").value = "";
  document.getElementById("board-name-error").style.display = "none";
  new bootstrap.Modal(document.getElementById("newBoardModal")).show();
}

// Color swatches
document.querySelectorAll(".swatch").forEach((sw) => {
  sw.addEventListener("click", () => {
    document
      .querySelectorAll(".swatch")
      .forEach((s) => s.classList.remove("selected"));
    sw.classList.add("selected");
    selectedColor = sw.dataset.color;
  });
});

document
  .getElementById("save-board-btn")
  .addEventListener("click", async () => {
    const name = document.getElementById("board-name-input").value.trim();
    if (!name) {
      document.getElementById("board-name-error").style.display = "block";
      return;
    }
    document.getElementById("board-name-error").style.display = "none";

    const payload = {
      name,
      description: document.getElementById("board-desc-input").value.trim(),
      color: selectedColor,
      visibility: document.querySelector('input[name="visibility"]:checked')
        .value,
      // starred: false,
    };

    setModalLoading("board-spinner", "save-board-btn", true);
    try {
      const created = await API.createBoard(payload);
      AppState.boards.unshift(created);
    } catch {
      // Optimistic local
      payload.id = Date.now();

      payload.taskCount = 0;
      payload.memberCount = 1;
      payload.updatedAt = new Date().toISOString().split("T")[0];
      AppState.boards.unshift(payload);
      showToast("Board created locally (API unavailable).", "warning");
    }
    renderBoards();
    bootstrap.Modal.getInstance(
      document.getElementById("newBoardModal"),
    ).hide();
    showToast(`Board "${name}" created!`, "success");
    setModalLoading("board-spinner", "save-board-btn", false);
  });

/* ============================================================
   DELETE BOARD
   ============================================================ */
let pendingDeleteId = null;

document
  .getElementById("confirm-delete-btn")
  .addEventListener("click", async () => {
    if (!pendingDeleteId) return;
    setModalLoading("delete-spinner", "confirm-delete-btn", true);
    const name =
      AppState.boards.find((b) => b.id === pendingDeleteId)?.name || "Board";
    try {
      await API.deleteBoard(pendingDeleteId);
    } catch {
      /* continue optimistically */
    }
    AppState.boards = AppState.boards.filter((b) => b.id !== pendingDeleteId);
    renderBoards();
    bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
    showToast(`"${name}" deleted.`, "info");
    pendingDeleteId = null;
    setModalLoading("delete-spinner", "confirm-delete-btn", false);
  });

/* ============================================================
   SEARCH & FILTER
   ============================================================ */
// document
//   .getElementById("search-input")
//   .addEventListener("input", function () {
//     AppState.search = this.value.toLowerCase().trim();
//     renderBoards();
//   });

// document.querySelectorAll(".filter-tab").forEach((tab) => {
//   tab.addEventListener("click", () => {
//     document
//       .querySelectorAll(".filter-tab")
//       .forEach((t) => t.classList.remove("active"));
//     tab.classList.add("active");
//     AppState.filter = tab.dataset.filter;
//     renderBoards();
//   });
// });

/* ============================================================
   SIDEBAR MOBILE
   ============================================================ */
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebar-overlay");
function openSidebar() {
  sidebar.classList.add("show");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeSidebar() {
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}
document
  .getElementById("sidebar-toggle")
  ?.addEventListener("click", () =>
    sidebar.classList.contains("show") ? closeSidebar() : openSidebar(),
  );
overlay.addEventListener("click", closeSidebar);

/* ============================================================
   HELPERS
   ============================================================ */
document
  .getElementById("new-board-btn")
  .addEventListener("click", openNewBoardModal);
document
  .getElementById("mobile-new-board")
  ?.addEventListener("click", openNewBoardModal);
document
  .getElementById("empty-new-btn")
  ?.addEventListener("click", openNewBoardModal);

function setModalLoading(spinnerId, btnId, on) {
  document.getElementById(btnId).disabled = on;
  document.getElementById(spinnerId).classList.toggle("d-none", !on);
}

function showToast(message, type = "info") {
  const el = document.createElement("div");
  el.className = "toast align-items-center show border-0 shadow-sm";
  el.style.cssText = `min-width:220px;border-radius:10px;background:#fff;border-left:4px solid ${type === "success" ? "#198754" : type === "warning" ? "#f59e0b" : type === "info" ? "#0f57d0" : "#a83836"}`;
  el.innerHTML = `<div class="d-flex align-items-center p-2 ps-3 gap-2">
    <span style="font-size:.85rem;font-weight:600;color:var(--on-surface)">${message}</span>
    <button type="button" class="btn-close ms-auto btn-close-sm"></button>
  </div>`;
  document.getElementById("toast-area").appendChild(el);
  el.querySelector(".btn-close").addEventListener("click", () => el.remove());
  setTimeout(() => el.remove(), 4000);
}

/* ============================================================
   INIT
   ============================================================ */
(async function init() {
  try {
    await API.getCurrentUser(); // si no hay token, lanza error 401
    document.body.style.visibility = "visible";
  } catch {
    window.location.href = "/login.html"; // redirige al login
    return; // detiene el resto del init
  }
  await Promise.all([loadUser(), loadBoards()]);
})();
