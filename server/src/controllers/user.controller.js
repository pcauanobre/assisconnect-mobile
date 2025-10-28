import UsuarioService from "../services/user.service.js";

export class UsuarioController {
    static async criarUsuario(req, res) {
        try {
            const usuario = await UsuarioService.create(req.body);
            return res.status(201).json(usuario);
        } catch (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }
    }

    static async listarUsuarios(req, res) {
        try {
            const usuarios = await UsuarioService.getAll();
            return res.status(200).json(usuarios);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async buscarUsuarioPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await UsuarioService.getById(id);
            return res.status(200).json(usuario);
        } catch (error) {
            console.error(error);
            return res.status(404).json({ error: error.message });
        }
    }
}
