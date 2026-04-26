/**
 * routes/users.js — Ambassador Management Routes
 */
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Ambassador = require("../models/User");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/users/onboard — GitHub-based onboarding (calls AI microservice)
router.post("/onboard", async (req, res) => {
  try {
    const { githubHandle } = req.body;
    if (!githubHandle) {
      return res.status(400).json({ success: false, error: "githubHandle is required" });
    }

    const handle = githubHandle.trim().toLowerCase();

    // Check if user already exists
    let user = await Ambassador.findOne({ githubHandle: handle });
    if (user) {
      return res.json({ success: true, user, isExisting: true });
    }

    // Call AI microservice to analyze GitHub profile
    const { data: evaluation } = await axios.get(
      `${AI_SERVICE_URL}/api/analyze-github/${handle}`
    );

    // Create new ambassador with evaluation data
    user = await Ambassador.create({
      githubHandle: handle,
      name: evaluation.github_profile?.name || handle,
      avatarUrl: evaluation.github_profile?.avatar_url || "",
      bio: evaluation.github_profile?.bio || "",
      devScore: evaluation.dev_score,
      strengths: evaluation.strengths,
      recruiterImpression: evaluation.recruiter_first_impression,
      reposToImprove: evaluation.repos_to_improve.map((r) => ({
        repoName: r.repo_name,
        feedback: r.feedback,
      })),
      nextSteps: evaluation.next_steps,
      evaluationSource: evaluation.evaluation_source,
      totalPoints: 0,
      currentStreak: 0,
      badges: [{ name: "Early Adopter", icon: "🌟" }],
    });

    res.status(201).json({ success: true, user, evaluation, isExisting: false });
  } catch (err) {
    const status = err.response?.status || 500;
    const detail = err.response?.data?.detail || err.message;
    res.status(status).json({ success: false, error: detail });
  }
});

// GET /api/users/:handle — Get ambassador by GitHub handle
router.get("/:handle", async (req, res) => {
  try {
    const user = await Ambassador.findOne({
      githubHandle: req.params.handle.toLowerCase(),
    }).populate("completedTasks");
    if (!user) return res.status(404).json({ success: false, error: "Ambassador not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users — Leaderboard (sorted by totalPoints)
router.get("/", async (_req, res) => {
  try {
    const users = await Ambassador.find({ status: "active" })
      .select("githubHandle name avatarUrl totalPoints devScore currentStreak badges")
      .sort({ totalPoints: -1 })
      .limit(50);
    res.json({ success: true, count: users.length, leaderboard: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/users/:handle/points — Update points (internal)
router.patch("/:handle/points", async (req, res) => {
  try {
    const { points, taskId } = req.body;
    const user = await Ambassador.findOne({
      githubHandle: req.params.handle.toLowerCase(),
    });
    if (!user) return res.status(404).json({ success: false, error: "Ambassador not found" });

    user.totalPoints += points;

    // Streak logic — check if active this ISO week
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const currentWeek = `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;

    if (user.lastActiveWeek !== currentWeek) {
      // Check if last activity was the previous week (streak continues)
      const lastWeekNum = parseInt(user.lastActiveWeek?.split("-W")[1] || "0");
      if (weekNum - lastWeekNum === 1) {
        user.currentStreak += 1;
      } else if (user.lastActiveWeek !== currentWeek) {
        user.currentStreak = 1;
      }
      user.lastActiveWeek = currentWeek;
      user.longestStreak = Math.max(user.longestStreak, user.currentStreak);
    }

    // Add task to completed if provided
    if (taskId && !user.completedTasks.includes(taskId)) {
      user.completedTasks.push(taskId);
    }

    // Badge awarding logic
    const badgeChecks = [
      { threshold: 100, name: "Century Club", icon: "💯" },
      { threshold: 500, name: "Point Master", icon: "⚡" },
      { threshold: 1000, name: "Legend", icon: "👑" },
    ];
    for (const badge of badgeChecks) {
      if (user.totalPoints >= badge.threshold && !user.badges.some((b) => b.name === badge.name)) {
        user.badges.push({ name: badge.name, icon: badge.icon });
      }
    }

    const streakBadges = [
      { threshold: 4, name: "Monthly Streak", icon: "🔥" },
      { threshold: 8, name: "Two-Month Streak", icon: "💪" },
    ];
    for (const badge of streakBadges) {
      if (user.currentStreak >= badge.threshold && !user.badges.some((b) => b.name === badge.name)) {
        user.badges.push({ name: badge.name, icon: badge.icon });
      }
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
