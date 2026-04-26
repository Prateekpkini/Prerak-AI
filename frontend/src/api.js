/**
 * api.js — Centralized API client for Doot Setu
 */
import axios from 'axios';

// In dev, Vite proxies /api to Express. In production, use full URL.
const API_BASE = import.meta.env.VITE_API_URL || '';
const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE, timeout: 30000 });
const aiApi = axios.create({ baseURL: AI_BASE, timeout: 60000 });

// ── GitHub Analysis (calls Python microservice directly for demo) ────────
export async function analyzeGitHub(username) {
  const { data } = await aiApi.get(`/api/analyze-github/${username}`);
  return data;
}

// ── User / Ambassador ────────────────────────────────────────────────────
export async function onboardUser(githubHandle) {
  const { data } = await api.post('/api/users/onboard', { githubHandle });
  return data;
}

export async function getUser(handle) {
  const { data } = await api.get(`/api/users/${handle}`);
  return data;
}

export async function getLeaderboard() {
  const { data } = await api.get('/api/users');
  return data;
}

// ── Tasks ────────────────────────────────────────────────────────────────
export async function getTasks() {
  const { data } = await api.get('/api/tasks');
  return data;
}

// ── Submissions ──────────────────────────────────────────────────────────
export async function submitProof(userId, taskId, proofUrl) {
  const { data } = await api.post('/api/submissions', { userId, taskId, proofUrl });
  return data;
}

export async function getUserSubmissions(userId) {
  const { data } = await api.get(`/api/submissions?userId=${userId}`);
  return data;
}

export default api;
