import express from "express";
import elderService from "../services/elder.service.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const elders = await elderService.getAll();
    res.json(elders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by ID
router.get("/:id", async (req, res) => {
  try {
    const elders = await elderService.getById(req.params.id);
    res.json(elders);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// QUERY ESPECIFICA DE GET (COLOCAR TIPO (EX: MEDICAMENTO, RESPONSAVEL, COMENTARIO, HUMOR, ALIMENTACAO))
// PADRÃO: localhost:3000/elder/[id]/query?tipo=humor
router.get("/:id/query", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;

    if (!tipo) {
      return res.status(400).json({
        error:
          "É necessário informar o parâmetro 'tipo' (responsavel, medicamentos, alimentacao, comentario).",
      });
    }

    const elder = await elderService.getById(id);
    if (!elder) {
      return res.status(404).json({ error: "Pessoa Idosa não encontrada." });
    }

    // switch direto, sem filtro por data
    switch (tipo.toLowerCase()) {
      case "responsavel":
        return res.json({ responsavel: elder.responsavel });

      case "medicamentos":
        return res.json({ medicamentos: elder.medicamentos });

      case "alimentacao":
        return res.json({ alimentacao: elder.alimentacao });

      case "comentario":
        return res.json({ comentario: elder.comentario });

      case "humor":
        return res.json({ humor: elder.humor });

      default:
        return res.status(400).json({
          error:
            "Tipo inválido. Use um dos seguintes: responsavel, medicamentos, alimentacao, comentario.",
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (create)
router.post("/", async (req, res) => {
  try {
    const novo = await elderService.create(req.body);
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update)
router.put("/:id", async (req, res) => {
  try {
    const atualizado = await elderService.update(req.params.id, req.body);
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await elderService.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
