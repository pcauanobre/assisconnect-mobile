// server/src/controllers/usuarioController.js
import usuarioService from "../services/user.service.js";

export class UsuarioController {
  static async criarUsuario(req, res) {
    try {
      const usuario = await usuarioService.create(req.body);
      return res.status(201).json(usuario);
    } catch (error) {
      console.error("❌ Erro ao criar usuário:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  static async listarUsuarios(req, res) {
    try {
      const usuarios = await usuarioService.getAll();
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("❌ Erro ao listar usuários:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async buscarUsuarioPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.getById(id);
      return res.status(200).json(usuario);
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      return res.status(404).json({ error: error.message });
    }
  }

  static async atualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.update(id, req.body);
      return res.status(200).json(usuario);
    } catch (error) {
      console.error("❌ Erro ao atualizar usuário:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  static async removerUsuario(req, res) {
    try {
      const { id } = req.params;
      const result = await usuarioService.remove(id);
      return res.status(200).json(result);
    } catch (error) {
      console.error("❌ Erro ao remover usuário:", error);
      return res.status(400).json({ error: error.message });
    }
  }
}
