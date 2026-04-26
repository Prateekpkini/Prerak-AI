/**
 * User.js — Ambassador Mongoose Schema
 * =====================================
 * Stores ambassador profile data, gamification state, and linked GitHub evaluation.
 */
const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: "🏆" },
  earnedAt: { type: Date, default: Date.now },
});

const ambassadorSchema = new mongoose.Schema(
  {
    githubHandle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    email: { type: String, default: "" },

    // GitHub Evaluation Data
    devScore: { type: Number, default: 0, min: 0, max: 100 },
    strengths: [{ type: String }],
    recruiterImpression: { type: String, default: "" },
    reposToImprove: [
      {
        repoName: String,
        feedback: String,
      },
    ],
    nextSteps: [{ type: String }],
    evaluationSource: { type: String, enum: ["gemini", "heuristic", ""], default: "" },

    // Gamification
    totalPoints: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveWeek: { type: String, default: "" }, // ISO week string like "2026-W17"
    badges: [badgeSchema],
    completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // Status
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "alumni"],
      default: "active",
    },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual for total completed task count
ambassadorSchema.virtual("completedCount").get(function () {
  return this.completedTasks.length;
});

// Ensure virtuals are included in JSON
ambassadorSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Ambassador", ambassadorSchema);
