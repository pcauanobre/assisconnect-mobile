import { Router } from "express";
import * as ctrl from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", ctrl.login);
router.get("/me", ctrl.me);

export default router;