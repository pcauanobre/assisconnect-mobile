import { Router } from "express";
import * as ctrl from "../controllers/elders.controller.js";

const router = Router();

// Example endpoints (customize later)
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;