import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/api/v1", routes);

export default app;