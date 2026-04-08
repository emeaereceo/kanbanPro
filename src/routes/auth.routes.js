import { Router } from "express";
import { logout, login, register } from "../controllers/auth.controllers.js";

const router = Router();

// Lógica

router.post("/login", login);
router.post("/register", register);

// TODO : Debe ser POST
router.post("/logout", logout);

export default router;
