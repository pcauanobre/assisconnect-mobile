// server/src/routes/authRoutes.js
import express from "express";
import { startLogin, verifyCode } from "../controllers/authController.js";

const router = express.Router();

router.post("/start", startLogin);   // POST /api/auth/start
router.post("/verify", verifyCode);  // POST /api/auth/verify

export default router;
