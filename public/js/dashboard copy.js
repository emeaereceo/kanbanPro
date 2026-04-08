const API = (() => {
  const BASE_URL = "http://localhost:3000/api/v1";

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
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    return res.json();
  }

  return {
    // Boards
    getBoards: () => request("GET", "/boards"),
    getBoardById: (id) => request("GET", `/boards/${id}`),
    // createBoard: (data) => request("POST", "/boards", data),

    getLists: (boardId) => request("GET", `/boards/${boardId}/lists`),
    // Columns / Status
    getColumns: (boardId) => request("GET", `/boards/${boardId}/columns`),

    // Tasks
    getTasks: (boardId) => request("GET", `/boards/${boardId}/tasks`),
    createTask: (boardId, data) =>
      request("POST", `/boards/${boardId}/tasks`, data),
    updateTask: (taskId, data) => request("PATCH", `/tasks/${taskId}`, data),
    deleteTask: (taskId) => request("DELETE", `/tasks/${taskId}`),
    moveTask: (taskId, status) =>
      request("PATCH", `/tasks/${taskId}`, { status }),

    // Users
    getCurrentUser: () => request("GET", "/users/me"),
    getBoardMembers: (boardId) => request("GET", `/boards/${boardId}/members`),
  };
})();

/* ============================================================
         MOCK DATA — used when API is unavailable (remove in prod)
         ============================================================ */
const MOCK = {
  user: {
    name: "Jordan Doe",
    email: "jordan@company.com",
    initials: "JD",
  },
  board: {
    id: 1,
    name: "Product Launch Board",
    taskCount: 6,
    memberCount: 4,
  },
  tasks: [
    {
      id: 1,
      title: "Design System Audit",
      status: "todo",
      tag: "Design",
      tagColor: "secondary",
      progress: null,
      assignees: ["JD"],
      dueDate: "Jun 24",
      accent: true,
    },
    {
      id: 2,
      title: "Client Onboarding Flow",
      status: "todo",
      tag: "UX",
      tagColor: "secondary",
      progress: null,
      assignees: ["MK"],
      dueDate: null,
      accent: false,
    },
    {
      id: 3,
      title: "Competitive Analysis Report",
      status: "todo",
      tag: "Strategy",
      tagColor: "tertiary",
      progress: null,
      assignees: ["AL"],
      dueDate: "Jul 2",
      accent: false,
    },
    {
      id: 4,
      title: "Integration with Stripe API for checkout flow",
      status: "in_progress",
      tag: "Development",
      tagColor: "secondary",
      progress: 65,
      assignees: ["MK"],
      dueDate: null,
      accent: true,
    },
    {
      id: 5,
      title: "Landing page A/B testing setup",
      status: "in_progress",
      tag: "Growth",
      tagColor: "tertiary",
      progress: null,
      assignees: ["JD"],
      dueDate: null,
      accent: false,
    },
    {
      id: 6,
      title: "Q4 Roadmap definition and sign-off",
      status: "done",
      tag: "Strategy",
      tagColor: "tertiary",
      progress: null,
      assignees: ["JD", "MK", "AL"],
      dueDate: null,
      accent: false,
    },
  ],
};

/* ============================================================
         RENDER ENGINE
         ============================================================ */
const COLUMNS = [
  { id: "todo", label: "To Do", pillClass: "bg-secondary-soft" },
  {
    id: "in_progress",
    label: "In Progress",
    pillClass: "bg-primary-soft",
  },
  { id: "done", label: "Done", pillClass: "bg-tertiary-soft" },
];

function tagClass(color) {
  return color === "tertiary"
    ? "bg-tertiary-soft"
    : color === "primary"
      ? "bg-primary-soft"
      : "bg-secondary-soft";
}

function renderAvatars(assignees) {
  return `<div class="avatar-stack">${assignees
    .map(
      (a) =>
        `<div class="avatar">${typeof a === "string" ? a : a.initials || "?"}</div>`,
    )
    .join("")}</div>`;
}

function renderTask(task) {
  const isDone = task.status === "done";
  const accent = task.accent
    ? `<div class="top-accent" style="background:linear-gradient(90deg,var(--primary),var(--primary-light))"></div>`
    : "";
  const progressBar =
    task.progress != null
      ? `
          <div class="mb-2">
            <div class="progress mt-2"><div class="progress-bar" style="width:${task.progress}%;background:var(--primary)"></div></div>
          </div>`
      : "";
  const due = task.dueDate
    ? `<span class="badge rounded-pill" style="font-size:.6rem;background:var(--surface-container);color:var(--outline)">${task.dueDate}</span>`
    : "";

  return `
          <div class="task-card ${isDone ? "done-card" : ""}" data-task-id="${task.id}">
            ${accent}
            <div class="d-flex flex-wrap gap-1 mb-2">
              <span class="tag ${tagClass(task.tagColor)}">${task.tag || ""}</span>
            </div>
            <h5>${task.title}</h5>
            ${progressBar}
            <div class="d-flex align-items-center justify-content-between mt-2">
              <div class="d-flex align-items-center">
                ${renderAvatars(task.assignees || [])}
                ${due}
              </div>
              <div class="d-flex gap-1">
                ${task.progress != null ? `<span class="meta"><span class="material-symbols-outlined" style="font-size:.9rem;vertical-align:middle">schedule</span> ${task.progress}%</span>` : ""}
                ${task.attachments ? `<span class="meta"><span class="material-symbols-outlined" style="font-size:.9rem;vertical-align:middle">attachment</span> ${task.attachments}</span>` : ""}
              </div>
            </div>
          </div>`;
}

function renderBoard(tasks) {
  const area = document.getElementById("board-area");
  area.innerHTML = "";

  COLUMNS.forEach((col) => {
    const colTasks = tasks.filter((t) => t.status === col.id);
    const colEl = document.createElement("div");
    colEl.className = "kanban-col";
    colEl.innerHTML = `
            <div class="col-header">
              <div class="col-title">
                ${col.label}
                <span class="pill ${col.pillClass}">${colTasks.length}</span>
              </div>
              <button class="btn btn-sm p-0" style="color:var(--on-surface-variant)">
                <span class="material-symbols-outlined" style="font-size:1.1rem">more_horiz</span>
              </button>
            </div>
            <div class="col-body" id="col-${col.id}">
              ${colTasks.map(renderTask).join("")}
              <button class="add-task-btn" data-col="${col.id}">
                <span class="material-symbols-outlined" style="font-size:1rem">add</span> Añadir tarea
              </button>
            </div>`;
    area.appendChild(colEl);
  });

  // Add column button
  const addCol = document.createElement("div");
  addCol.innerHTML = `<button class="add-col-btn" id="add-col-btn"><span class="material-symbols-outlined" style="font-size:1rem">add</span> Nueva lista</button>`;
  area.appendChild(addCol);
  document.getElementById("add-col-btn").addEventListener("click", () => {
    new bootstrap.Modal(document.getElementById("newColumnModal")).show();
  });

  // Wire up "Add Task" per column
  area.querySelectorAll(".add-task-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById("task-status-input").value = btn.dataset.col;
      new bootstrap.Modal(document.getElementById("newTaskModal")).show();
    });
  });
}

/* ============================================================
         DATA LOADING
         ============================================================ */
//const ACTIVE_BOARD_ID = 1; // ← replace with dynamic board selector if needed
const params = new URLSearchParams(window.location.search);
const ACTIVE_BOARD_ID = parseInt(params.get("board")) || 1;

async function loadUser() {
  try {
    const { user } = await API.getCurrentUser();

    document.getElementById("sidebar-username").textContent = user.name;
    document.getElementById("sidebar-email").textContent = user.email;
    document.getElementById("sidebar-avatar").textContent =
      user.initials || user.name.slice(0, 2).toUpperCase();
  } catch {
    const u = MOCK.user;
    document.getElementById("sidebar-username").textContent = u.name;
    document.getElementById("sidebar-email").textContent = u.email;
    document.getElementById("sidebar-avatar").textContent = u.initials;
  }
}

// Es necesario llamar esta función cada vez que se crea una tarea, una lista o un tablero
async function loadBoard() {
  try {
    const [board, tasks] = await Promise.all([
      API.getBoardById(ACTIVE_BOARD_ID),
      API.getTasks(ACTIVE_BOARD_ID),
    ]);
    applyBoardData(board, tasks);
  } catch {
    // Fallback to mock
    applyBoardData(MOCK.board, MOCK.tasks);
    showToast("Using demo data — connect your API.", "warning");
  }
}

function applyBoardData(board, tasks) {
  document.getElementById("topbar-board-name").textContent = board.name;
  document.getElementById("topbar-task-count").textContent =
    `${tasks.length} tasks`;
  document.getElementById("sidebar-boards-count").textContent = tasks.length;
  renderBoard(tasks);
  AppState.tasks = tasks;
}

/* ============================================================
         SEARCH
         ============================================================ */
const AppState = { tasks: [] };

// document
//   .getElementById("search-input")
//   .addEventListener("input", function () {
//     const q = this.value.toLowerCase().trim();
//     const filtered = q
//       ? AppState.tasks.filter(
//           (t) =>
//             t.title.toLowerCase().includes(q) ||
//             (t.tag || "").toLowerCase().includes(q),
//         )
//       : AppState.tasks;
//     renderBoard(filtered);
//   });

/* ============================================================
         NEW TASK
         ============================================================ */
async function handleCreateTask() {
  const title = document.getElementById("task-title-input").value.trim();
  if (!title) return;

  const payload = {
    title,
    status: document.getElementById("task-status-input").value,
    dueDate: document.getElementById("task-due-input").value || null,
    tag: document.getElementById("task-tag-input").value.trim() || "General",
    tagColor: "secondary",
  };

  const btn = document.getElementById("save-task-btn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    await API.createTask(ACTIVE_BOARD_ID, payload);
    showToast("Task created!", "success");
    bootstrap.Modal.getInstance(document.getElementById("newTaskModal")).hide();
    await loadBoard();
  } catch {
    // Optimistic local add (demo)
    payload.id = Date.now();
    payload.assignees = ["JD"];
    AppState.tasks.push(payload);
    renderBoard(AppState.tasks);
    bootstrap.Modal.getInstance(document.getElementById("newTaskModal")).hide();
    showToast("Task added locally (API unavailable).", "warning");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Task";
  }
}

document
  .getElementById("save-task-btn")
  .addEventListener("click", handleCreateTask);
document
  .getElementById("new-task-btn")
  .addEventListener("click", () =>
    new bootstrap.Modal(document.getElementById("newTaskModal")).show(),
  );

/* ============================================================
   NEW COLUMN
   ============================================================ */
document.getElementById("save-col-btn").addEventListener("click", () => {
  const name = document.getElementById("col-name-input").value.trim();
  if (!name) return;
  const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  COLUMNS.push({ id, label: name, pillClass: "bg-secondary-soft" });
  renderBoard(AppState.tasks);
  bootstrap.Modal.getInstance(document.getElementById("newColumnModal")).hide();
  document.getElementById("col-name-input").value = "";
  showToast(`Column "${name}" added.`, "success");
});
document
  .getElementById("new-task-btn")
  .addEventListener("click", () =>
    new bootstrap.Modal(document.getElementById("newTaskModal")).show(),
  );
document
  .getElementById("mobile-new-task")
  ?.addEventListener("click", () =>
    new bootstrap.Modal(document.getElementById("newTaskModal")).show(),
  );

/* ============================================================
         REFRESH
         ============================================================ */
// document
//   .getElementById("refresh-btn")
//   .addEventListener("click", async () => {
//     document
//       .getElementById("refresh-btn")
//       .querySelector(".material-symbols-outlined").style.animation =
//       "spin .7s linear infinite";
//     await loadBoard();
//     document
//       .getElementById("refresh-btn")
//       .querySelector(".material-symbols-outlined").style.animation = "";
//   });

/* ============================================================
         MOBILE SIDEBAR TOGGLE
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

document.getElementById("sidebar-toggle")?.addEventListener("click", () => {
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});
overlay.addEventListener("click", closeSidebar);

/* ============================================================
         TOAST HELPER
         ============================================================ */
function showToast(message, type = "info") {
  const colors = {
    success: "#198754",
    warning: "#f59e0b",
    error: "#a83836",
    info: "#0f57d0",
  };
  const el = document.createElement("div");
  el.className = "toast align-items-center show border-0 shadow-sm";
  el.style.cssText = `min-width:220px;border-radius:10px;background:#fff;border-left:4px solid ${type === "success" ? "#198754" : type === "warning" ? "#f59e0b" : "#0f57d0"}!important`;
  el.innerHTML = `<div class="d-flex align-items-center p-2 ps-3 gap-2">
          <span style="font-size:.85rem;font-weight:600;color:var(--on-surface)">${message}</span>
          <button type="button" class="btn-close ms-auto btn-close-sm" data-bs-dismiss="toast"></button>
        </div>`;
  document.getElementById("toast-area").appendChild(el);
  el.querySelector(".btn-close").addEventListener("click", () => el.remove());
  setTimeout(() => el.remove(), 4000);
}

/* ============================================================
         INIT
         ============================================================ */
(async function init() {
  await Promise.all([loadUser(), loadBoard()]);
})();
