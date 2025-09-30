import express from "express";
import { elderService } from "../services/elder.service.js";

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
