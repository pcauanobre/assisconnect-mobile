import { Router } from "express";
import authRoutes from "./auth.routes.js";
import eldersRoutes from "./elders.routes.js";
import activitiesRoutes from "./activities.routes.js";
import attendanceRoutes from "./attendance.routes.js";
import menusRoutes from "./menus.routes.js";
import visitsRoutes from "./visits.routes.js";
import requestsRoutes from "./requests.routes.js";
import reportsRoutes from "./reports.routes.js";
import notificationsRoutes from "./notifications.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/elders", eldersRoutes);
router.use("/activities", activitiesRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/menus", menusRoutes);
router.use("/visits", visitsRoutes);
router.use("/edit-requests", requestsRoutes);
router.use("/reports", reportsRoutes);
router.use("/notifications", notificationsRoutes);

export default router;