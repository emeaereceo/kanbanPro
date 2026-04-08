import { Router } from "express";
import { authVerify } from "../middlewares/authVerify.js";

import authRoutes from "./auth.routes.js";
// import taskRoutes from "./tasks.routes.js";
// import profileRoutes from "./profile.routes.js";
import apiRoutes from "./api.routes.js";

const router = Router();

// Rutas publicas
router.use("/api/v1/auth", authRoutes);
// API RESTful protegida  →  /api/...
router.use("/api/v1", authVerify, apiRoutes);

export default router;
