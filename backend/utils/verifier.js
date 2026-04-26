/**
 * verifier.js — Auto-Verification Utility
 * =========================================
 * NLP/Regex-based proof-of-work verification for task submissions.
 * Checks if submitted URLs contain evidence of completed work.
 */

const ORG_NAME = process.env.ORG_NAME || "DootSetu";

/**
 * URL format validation
 */
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Core verification engine — uses regex patterns and NLP heuristics
 * to determine if a submitted URL constitutes valid proof of work.
 *
 * @param {string} url - The submitted proof URL
 * @param {string} taskType - Type of task (blog, workshop, social, code, etc.)
 * @param {string} requiredPattern - Optional custom regex pattern
 * @returns {{ verified: boolean, confidence: number, reason: string }}
 */
function verifySubmission(url, taskType, requiredPattern = "") {
  if (!isValidUrl(url)) {
    return { verified: false, confidence: 0, reason: "Invalid URL format" };
  }

  const urlLower = url.toLowerCase();
  const orgLower = ORG_NAME.toLowerCase();
  let confidence = 0;
  const reasons = [];

  // ── 1. Organization Name Check ──────────────────────────────────────
  // Does the URL or its path contain the org name? Strong signal.
  if (urlLower.includes(orgLower) || urlLower.includes("doot") || urlLower.includes("setu")) {
    confidence += 30;
    reasons.push("URL contains organization reference");
  }

  // ── 2. Custom Pattern Match ─────────────────────────────────────────
  if (requiredPattern) {
    try {
      const regex = new RegExp(requiredPattern, "i");
      if (regex.test(url)) {
        confidence += 35;
        reasons.push("Matches required URL pattern");
      }
    } catch {
      // Invalid regex, skip
    }
  }

  // ── 3. Task-Type Specific Verification ──────────────────────────────
  const platformPatterns = {
    blog: {
      domains: ["medium.com", "dev.to", "hashnode.dev", "substack.com", "wordpress.com", "blogger.com", "notion.so", "ghost.io"],
      keywords: ["blog", "article", "post", "write", "tutorial", "guide"],
      bonus: 25,
    },
    workshop: {
      domains: ["youtube.com", "youtu.be", "drive.google.com", "loom.com", "zoom.us", "meet.google.com", "eventbrite.com", "lu.ma"],
      keywords: ["workshop", "session", "recording", "event", "meetup", "presentation"],
      bonus: 25,
    },
    social: {
      domains: ["twitter.com", "x.com", "linkedin.com", "instagram.com", "facebook.com", "threads.net"],
      keywords: ["post", "tweet", "share", "status"],
      bonus: 20,
    },
    code: {
      domains: ["github.com", "gitlab.com", "bitbucket.org", "replit.com", "codesandbox.io", "stackblitz.com"],
      keywords: ["repo", "pull", "commit", "merge", "fork", "project"],
      bonus: 25,
    },
    community: {
      domains: ["discord.com", "slack.com", "meetup.com", "lu.ma", "eventbrite.com", "community"],
      keywords: ["community", "group", "server", "channel", "members"],
      bonus: 20,
    },
    event: {
      domains: ["eventbrite.com", "lu.ma", "meetup.com", "konfhub.com", "townscript.com"],
      keywords: ["event", "conference", "hackathon", "workshop", "meetup"],
      bonus: 25,
    },
  };

  const typeConfig = platformPatterns[taskType] || {};

  // Check if URL is from an expected platform
  if (typeConfig.domains) {
    const domainMatch = typeConfig.domains.some((d) => urlLower.includes(d));
    if (domainMatch) {
      confidence += typeConfig.bonus || 20;
      reasons.push(`URL is from a recognized ${taskType} platform`);
    }
  }

  // Check for task-type keywords in URL path
  if (typeConfig.keywords) {
    const keywordMatch = typeConfig.keywords.some((k) => urlLower.includes(k));
    if (keywordMatch) {
      confidence += 10;
      reasons.push(`URL contains ${taskType}-related keywords`);
    }
  }

  // ── 4. General Quality Signals ──────────────────────────────────────
  // HTTPS check
  if (url.startsWith("https://")) {
    confidence += 5;
  }

  // Not a homepage (has a path beyond /)
  try {
    const parsed = new URL(url);
    if (parsed.pathname.length > 1) {
      confidence += 5;
      reasons.push("URL points to specific content, not a homepage");
    }
  } catch {
    // Already validated above
  }

  // Cap confidence at 100
  confidence = Math.min(100, confidence);

  // ── Decision ────────────────────────────────────────────────────────
  const verified = confidence >= 40;
  const reason = reasons.length > 0
    ? reasons.join("; ")
    : "URL did not match expected patterns for this task type";

  return { verified, confidence, reason };
}

module.exports = { verifySubmission, isValidUrl };
