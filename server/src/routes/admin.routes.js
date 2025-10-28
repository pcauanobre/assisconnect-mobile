// server/src/routes/admin.routes.js
import express from "express";
import { createElderAndUser, linkUserToElder } from "../controllers/admin.controller.js";

const router = express.Router();

// Cria idoso + usuário responsável de uma vez
router.post("/elder-with-user", createElderAndUser);

// Vincula um usuário já existente a um idoso já existente
router.patch("/link-user/:userId/elder/:elderId", linkUserToElder);

export default router;
