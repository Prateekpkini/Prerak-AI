/**
 * seed.js — Database Seeder for Doot Setu
 * =========================================
 * Populates the database with sample tasks for demo/hackathon purposes.
 * Run with: npm run seed
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Task = require("./models/Task");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/doot-setu";

const sampleTasks = [
  {
    title: "Host a MERN Stack Workshop",
    description: "Organize and conduct a hands-on workshop teaching MERN stack fundamentals to at least 15 attendees. Share the recording or event link as proof.",
    points: 200,
    type: "workshop",
    difficulty: "hard",
    icon: "🎓",
    tags: ["mern", "workshop", "teaching"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(youtube|youtu\\.be|drive\\.google|loom|zoom|lu\\.ma|eventbrite)",
  },
  {
    title: "Write an API Integration Blog",
    description: "Publish a technical blog post (1000+ words) about integrating a REST or GraphQL API. Must reference Doot Setu or our tech stack.",
    points: 150,
    type: "blog",
    difficulty: "medium",
    icon: "✍️",
    tags: ["blog", "api", "writing"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(medium|dev\\.to|hashnode|substack|wordpress|notion)",
  },
  {
    title: "Share a Dev Thread on X/Twitter",
    description: "Create a technical thread (5+ tweets) sharing insights from your campus ambassador journey or a tech tutorial. Tag @DootSetu.",
    points: 75,
    type: "social",
    difficulty: "easy",
    icon: "🐦",
    tags: ["social", "twitter", "thread"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(twitter\\.com|x\\.com)",
  },
  {
    title: "Contribute to an Open-Source Project",
    description: "Submit a meaningful pull request to any open-source repository. The PR must be merged or in review.",
    points: 250,
    type: "code",
    difficulty: "hard",
    icon: "🔀",
    tags: ["open-source", "github", "code"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(github\\.com.*pull|gitlab\\.com.*merge_requests)",
  },
  {
    title: "Build a Mini Project with React",
    description: "Create and deploy a small React project (calculator, weather app, portfolio, etc.). Share the live link or GitHub repo.",
    points: 175,
    type: "code",
    difficulty: "medium",
    icon: "⚛️",
    tags: ["react", "project", "deploy"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(github\\.com|vercel\\.app|netlify\\.app|railway\\.app|render\\.com)",
  },
  {
    title: "Organize a Campus Meetup",
    description: "Host a developer community meetup at your campus with at least 10 attendees. Share event photos or registration link.",
    points: 300,
    type: "event",
    difficulty: "hard",
    icon: "🏛️",
    tags: ["event", "campus", "community"],
    verificationMethod: "url_check",
    requiredUrlPattern: "(lu\\.ma|meetup|eventbrite|konfhub|drive\\.google)",
  },
  {
    title: "Create a LinkedIn Tech Post",
    description: "Write a thoughtful LinkedIn post about a technology topic, your learning journey, or ambassador experience. Must include #DootSetu.",
    points: 50,
    type: "social",
    difficulty: "easy",
    icon: "💼",
    tags: ["linkedin", "social", "networking"],
    verificationMethod: "url_check",
    requiredUrlPattern: "linkedin\\.com",
  },
  {
    title: "Build & Share a Cheat Sheet",
    description: "Create a visually appealing cheat sheet or infographic for a programming language, framework, or tool. Share on GitHub or social media.",
    points: 100,
    type: "community",
    difficulty: "medium",
    icon: "📊",
    tags: ["cheatsheet", "design", "education"],
    verificationMethod: "url_check",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await Task.deleteMany({});
    console.log("Cleared existing tasks");

    const created = await Task.insertMany(sampleTasks);
    console.log(`✅ Seeded ${created.length} tasks`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
