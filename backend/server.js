/**
 * server.js — Doot Setu Express Backend
 * ======================================
 * Core API server handling ambassador management, task tracking,
 * submission verification, and gamification logic.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/tasks");
const userRoutes = require("./routes/users");
const submissionRoutes = require("./routes/submissions");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());

// ── Request Logger ────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ service: "Doot Setu Backend", status: "operational", version: "1.0.0" });
});

app.get("/health", (_req, res) => res.json({ status: "healthy" }));

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/submissions", submissionRoutes);

// ── MongoDB Connection & Server Start ─────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/doot-setu";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Doot Setu Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    // Start server anyway for demo purposes (routes will return DB errors)
    app.listen(PORT, () => {
      console.log(`⚠️  Server running WITHOUT database on http://localhost:${PORT}`);
    });
  });

module.exports = app;
