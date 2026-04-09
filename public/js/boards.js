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
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }
  return {
    getBoards: () => request("GET", "/boards"),
    createBoard: (data) => request("POST", "/boards", data),
    deleteBoard: (id) => request("DELETE", `/boards/${id}`),
    getCurrentUser: () => request("GET", "/users/me"),
    updateBoard: (boardId, data) => request("PUT", `/boards/${boardId}`, data),
    logout: () => request("POST", "/auth/logout"),
  };
})();

const AppState = { boards: [], filter: "all", search: "" };

function formatDate(str) {
  if (!str) return "";
  return new Date(str).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
}

function openEditBoard(board) {
  document.getElementById("edit-board-name-input").value = board.name || "";
  document.getElementById("edit-board-desc-input").value =
    board.description || "";

  // Marcar el color actual
  document.querySelectorAll("#edit-color-swatches .swatch").forEach((s) => {
    s.classList.toggle("selected", s.dataset.color === board.color);
  });

  // Marcar visibilidad actual
  document.querySelector(
    `input[name="edit-visibility"][value="${board.visibility || "private"}"]`,
  ).checked = true;

  document.getElementById("update-board-btn").dataset.boardId = board.id;
  new bootstrap.Modal(document.getElementById("editBoardModal")).show();
}

// Swatches del modal de edición
document.querySelectorAll("#edit-color-swatches .swatch").forEach((s) => {
  s.addEventListener("click", () => {
    document
      .querySelectorAll("#edit-color-swatches .swatch")
      .forEach((x) => x.classList.remove("selected"));
    s.classList.add("selected");
  });
});

// Guardar cambios
document
  .getElementById("update-board-btn")
  .addEventListener("click", async () => {
    const name = document.getElementById("edit-board-name-input").value.trim();
    if (!name) {
      document.getElementById("edit-board-name-error").style.display = "block";
      return;
    }
    document.getElementById("edit-board-name-error").style.display = "none";

    const boardId = document.getElementById("update-board-btn").dataset.boardId;
    const selectedColor = document.querySelector(
      "#edit-color-swatches .swatch.selected",
    )?.dataset.color;
    const visibility = document.querySelector(
      'input[name="edit-visibility"]:checked',
    ).value;

    const spinner = document.getElementById("edit-board-spinner");
    spinner.classList.remove("d-none");

    try {
      await API.updateBoard(boardId, {
        name,
        description: document
          .getElementById("edit-board-desc-input")
          .value.trim(),
        color: selectedColor,
        visibility,
      });
      showToast("Tablero actualizado!", "success");
      bootstrap.Modal.getInstance(
        document.getElementById("editBoardModal"),
      ).hide();
      await renderBoards();
    } catch (err) {
      console.error(err);
      showToast("No se pudo actualizar el tablero.", "error");
    } finally {
      spinner.classList.add("d-none");
    }
  });

// Reset al cerrar
document
  .getElementById("editBoardModal")
  .addEventListener("hidden.bs.modal", () => {
    document.getElementById("edit-board-name-error").style.display = "none";
    document.getElementById("update-board-btn").dataset.boardId = "";
  });

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

        <div class="card-actions">
          <button class="edit-btn" data-id="${board.id}" title="Edit board">
            <span class="material-symbols-outlined" style="font-size:1.1rem">edit</span>
          </button>

          <button class="delete-btn" data-id="${board.id}" title="Delete board">
            <span class="material-symbols-outlined" style="font-size:1.1rem">delete</span>
          </button>
        </div>
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

    col.querySelector(".board-card").addEventListener("click", (e) => {
      if (e.target.closest(".delete-btn") || e.target.closest(".edit-btn"))
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
    // Edit
    col.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditBoard(board);
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

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await API.logout();
  } catch (err) {
    console.error(err);
  } finally {
    window.location.href = "/login.html";
  }
});

(async function init() {
  try {
    await API.getCurrentUser();
    document.body.style.visibility = "visible";
  } catch {
    window.location.href = "/login.html";
    return;
  }
  await Promise.all([loadUser(), loadBoards()]);
})();
