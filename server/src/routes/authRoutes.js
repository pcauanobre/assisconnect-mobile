// server/src/routes/authRoutes.js
import express from "express";
import { startLogin, verifyCode } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/start  -> prepara login e dispara e-mail em background
router.post("/start", startLogin);

// POST /api/auth/verify -> valida o código
router.post("/verify", verifyCode);

export default router;
