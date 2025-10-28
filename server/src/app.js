import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import elderRoutes from "./routes/elder.routes.js";
import userRoutes from "./routes/user.routes.js"

const app = express();

// CORS + JSON
app.use(cors({ origin: true }));
app.use(express.json());

// 🔎 Logger de TODAS as requisições
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  res.setHeader("X-Server", "assisconnect-local");
  next();
});

// Health/ping
app.get("/api/v1/health", (_req, res) => res.json({ ok: true }));
app.get("/api/auth/ping", (_req, res) => res.json({ pong: true }));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/elder", elderRoutes);
app.use("/user", userRoutes)

export default app;
