/**
 * routes/tasks.js — Task CRUD & Management Routes
 */
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET /api/tasks — Fetch all active tasks
router.get("/", async (_req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id — Get single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks — Create new task (admin)
router.post("/", async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/tasks/:id — Update task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id — Soft delete (deactivate)
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });
    res.json({ success: true, message: "Task deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
