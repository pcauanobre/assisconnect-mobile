import express from "express";
import { UsuarioController } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", UsuarioController.criarUsuario);
router.get("/", UsuarioController.listarUsuarios);
router.get("/:id", UsuarioController.buscarUsuarioPorId);

export default router;
