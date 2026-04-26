/**
 * Task.js — Task/Bounty Mongoose Schema
 * ======================================
 * Defines the structure for ambassador tasks and bounties.
 */
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    points: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["workshop", "blog", "social", "code", "community", "event"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    icon: { type: String, default: "📋" },

    // Verification
    verificationMethod: {
      type: String,
      enum: ["url_check", "manual", "auto"],
      default: "url_check",
    },
    requiredUrlPattern: { type: String, default: "" }, // Regex pattern for auto-verification

    // Status
    isActive: { type: Boolean, default: true },
    deadline: { type: Date },
    maxCompletions: { type: Number, default: 0 }, // 0 = unlimited
    currentCompletions: { type: Number, default: 0 },

    // Metadata
    tags: [{ type: String }],
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
