import { Router } from "express";
import {
  getAllTableros,
  getBoardById,
  createTablero,
  updateTablero,
  deleteTablero,
  createLista,
  // updateLista,
  // deleteLista,
  createTarjeta,
  updateTarjeta,
  // deleteTarjeta,
  getCurrentUser,
} from "../controllers/api.controllers.js";

const router = Router();

router.get("/users/me", getCurrentUser);

router.get("/boards", getAllTableros);
router.get("/boards/:boardId", getBoardById);
router.post("/boards", createTablero);
router.put("/boards/:boardId", updateTablero);
router.delete("/boards/:boardId", deleteTablero);

router.post("/boards/:boardId/lists", createLista);
// router.put("/tableros/:tableroId/listas/:listaId", updateLista);
// router.delete("/tableros/:tableroId/listas/:listaId", deleteLista);

router.post("/lists/:listId/tasks", createTarjeta);
// router.put("/listas/:listaId/tarjetas/:tarjetaId", updateTarjeta);
router.put("/tasks/:taskId", updateTarjeta);
// router.delete("/listas/:listaId/tarjetas/:tarjetaId", deleteTarjeta);

export default router;
