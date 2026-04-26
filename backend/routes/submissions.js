/**
 * routes/submissions.js — Task Submission & Auto-Verification Routes
 */
const express = require("express");
const router = express.Router();
const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Ambassador = require("../models/User");
const { verifySubmission } = require("../utils/verifier");

// POST /api/submissions — Submit proof of work for a task
router.post("/", async (req, res) => {
  try {
    const { userId, taskId, proofUrl } = req.body;

    if (!userId || !taskId || !proofUrl) {
      return res.status(400).json({
        success: false,
        error: "userId, taskId, and proofUrl are all required",
      });
    }

    // Validate user and task exist
    const [user, task] = await Promise.all([
      Ambassador.findById(userId),
      Task.findById(taskId),
    ]);

    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    // Check for duplicate submission
    const existing = await Submission.findOne({ userId, taskId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "You have already submitted proof for this task",
        submission: existing,
      });
    }

    // ── Auto-Verification via NLP/Regex Engine ────────────────────────
    const verification = verifySubmission(proofUrl, task.type, task.requiredUrlPattern);

    const submission = await Submission.create({
      userId,
      taskId,
      proofUrl,
      status: verification.verified ? "verified" : "pending",
      verificationDetails: `Confidence: ${verification.confidence}% — ${verification.reason}`,
      pointsAwarded: verification.verified ? task.points : 0,
    });

    // If auto-verified, award points and update user
    if (verification.verified) {
      // Update task completion count
      task.currentCompletions += 1;
      await task.save();

      // Award points to user (trigger streak + badge logic)
      user.totalPoints += task.points;
      if (!user.completedTasks.includes(taskId)) {
        user.completedTasks.push(taskId);
      }

      // Streak update
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      const currentWeek = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

      if (user.lastActiveWeek !== currentWeek) {
        const lastWeekNum = parseInt(user.lastActiveWeek?.split("-W")[1] || "0");
        user.currentStreak = weekNum - lastWeekNum === 1 ? user.currentStreak + 1 : 1;
        user.lastActiveWeek = currentWeek;
        user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
      }

      // Badge checks
      const badges = [
        { threshold: 100, name: "Century Club", icon: "💯" },
        { threshold: 500, name: "Point Master", icon: "⚡" },
        { threshold: 1000, name: "Legend", icon: "👑" },
      ];
      for (const b of badges) {
        if (user.totalPoints >= b.threshold && !user.badges.some((x) => x.name === b.name)) {
          user.badges.push({ name: b.name, icon: b.icon });
        }
      }

      // First completion badge
      if (user.completedTasks.length === 1 && !user.badges.some((b) => b.name === "First Blood")) {
        user.badges.push({ name: "First Blood", icon: "🎯" });
      }

      await user.save();
    }

    res.status(201).json({
      success: true,
      submission,
      verification: {
        autoVerified: verification.verified,
        confidence: verification.confidence,
        reason: verification.reason,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/submissions?userId=xxx — Get submissions for a user
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.taskId) filter.taskId = req.query.taskId;

    const submissions = await Submission.find(filter)
      .populate("taskId", "title points type icon")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
