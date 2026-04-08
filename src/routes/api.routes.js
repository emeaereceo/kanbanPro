import { Router } from "express";
import {
  getAllTableros,
  getBoardById,
  createTablero,
  // updateTablero,
  deleteTablero,
  createLista,
  updateLista,
  deleteLista,
  createTarjeta,
  updateTarjeta,
  deleteTarjeta,
  getCurrentUser,
} from "../controllers/api.controllers.js";

const router = Router();

// ─────────────────────────────────────────────
// USUARIOS  →  /api/usuarios
// ─────────────────────────────────────────────

router.get("/users/me", getCurrentUser);
// ─────────────────────────────────────────────
// TABLEROS  →  /api/tableros
// ─────────────────────────────────────────────
router.get("/boards", getAllTableros);
router.get("/boards/:boardId", getBoardById);
router.post("/boards", createTablero);
// router.put("/tableros/:tableroId", updateTablero);
router.delete("/boards/:boardId", deleteTablero);

// ─────────────────────────────────────────────
// LISTAS  →  /api/tableros/:tableroId/listas
// ─────────────────────────────────────────────
router.post("/tableros/:tableroId/listas", createLista);
router.put("/tableros/:tableroId/listas/:listaId", updateLista);
router.delete("/tableros/:tableroId/listas/:listaId", deleteLista);

// ─────────────────────────────────────────────
// TARJETAS  →  /api/listas/:listaId/tarjetas
// ─────────────────────────────────────────────
router.post("/listas/:listaId/tarjetas", createTarjeta);
router.put("/listas/:listaId/tarjetas/:tarjetaId", updateTarjeta);
router.delete("/listas/:listaId/tarjetas/:tarjetaId", deleteTarjeta);

export default router;
