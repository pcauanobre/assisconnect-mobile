// server/src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// 🔹 Carrega variáveis do .env antes de qualquer outra coisa
dotenv.config();

import authRoutes from "./routes/authRoutes.js";
// (Caso tenha outras rotas, você pode importá-las aqui)

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

// Rotas de autenticação (CPF -> email)
app.use("/api/auth", authRoutes);

export default app;
