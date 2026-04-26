/**
 * TaskBoard.jsx — Bounty Board with Task Submission
 * ===================================================
 * Displays available tasks/bounties with submit-proof functionality.
 */
import { useState, useEffect } from 'react';
import {
  ExternalLink, Send, CheckCircle2, Clock, Loader2,
  Filter, Sparkles, AlertCircle,
} from 'lucide-react';
import { getTasks, submitProof } from '../api';

const TYPE_CONFIG = {
  workshop: { color: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'task-workshop', label: 'Workshop' },
  blog: { color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'task-blog', label: 'Blog' },
  social: { color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'task-social', label: 'Social' },
  code: { color: 'text-accent-yellow', bg: 'bg-accent-yellow/10', border: 'task-code', label: 'Code' },
  community: { color: 'text-accent-pink', bg: 'bg-accent-pink/10', border: 'task-community', label: 'Community' },
  event: { color: 'text-accent-orange', bg: 'bg-accent-orange/10', border: 'task-event', label: 'Event' },
};

const DIFFICULTY_BADGE = {
  easy: 'bg-green-500/15 text-green-400',
  medium: 'bg-yellow-500/15 text-yellow-400',
  hard: 'bg-red-500/15 text-red-400',
};

// Fallback tasks for demo when backend isn't connected
const DEMO_TASKS = [
  { _id: 'd1', title: 'Host a MERN Stack Workshop', description: 'Organize a hands-on workshop teaching MERN stack fundamentals to at least 15 attendees.', points: 200, type: 'workshop', difficulty: 'hard', icon: '🎓', tags: ['mern', 'workshop'] },
  { _id: 'd2', title: 'Write an API Integration Blog', description: 'Publish a technical blog post (1000+ words) about integrating a REST or GraphQL API.', points: 150, type: 'blog', difficulty: 'medium', icon: '✍️', tags: ['blog', 'api'] },
  { _id: 'd3', title: 'Share a Dev Thread on X/Twitter', description: 'Create a thread (5+ tweets) sharing insights from your ambassador journey. Tag @DootSetu.', points: 75, type: 'social', difficulty: 'easy', icon: '🐦', tags: ['social', 'twitter'] },
  { _id: 'd4', title: 'Contribute to Open-Source', description: 'Submit a meaningful pull request to any open-source repository.', points: 250, type: 'code', difficulty: 'hard', icon: '🔀', tags: ['open-source', 'github'] },
  { _id: 'd5', title: 'Build a Mini React Project', description: 'Create and deploy a small React project. Share the live link or GitHub repo.', points: 175, type: 'code', difficulty: 'medium', icon: '⚛️', tags: ['react', 'project'] },
  { _id: 'd6', title: 'Organize a Campus Meetup', description: 'Host a developer meetup at your campus with at least 10 attendees.', points: 300, type: 'event', difficulty: 'hard', icon: '🏛️', tags: ['event', 'campus'] },
  { _id: 'd7', title: 'LinkedIn Tech Post', description: 'Write a LinkedIn post about a technology topic or your learning journey. Include #DootSetu.', points: 50, type: 'social', difficulty: 'easy', icon: '💼', tags: ['linkedin', 'social'] },
  { _id: 'd8', title: 'Build & Share a Cheat Sheet', description: 'Create a visually appealing cheat sheet for a programming language or framework.', points: 100, type: 'community', difficulty: 'medium', icon: '📊', tags: ['cheatsheet', 'design'] },
];

export default function TaskBoard({ user, onPointsEarned }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedTask, setExpandedTask] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTasks();
        setTasks(data.tasks?.length ? data.tasks : DEMO_TASKS);
      } catch {
        setTasks(DEMO_TASKS);
      }
    })();
  }, []);

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.type === filter);
  const types = ['all', ...new Set(tasks.map((t) => t.type))];

  const handleSubmit = async (taskId, points) => {
    if (!proofUrl.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await submitProof(user._id, taskId, proofUrl.trim());
      setSubmitResult(result);
      if (result.verification?.autoVerified) {
        onPointsEarned(points);
      }
    } catch (err) {
      // Demo mode — simulate verification
      const isVerified = /medium|dev\.to|github|linkedin|twitter|x\.com|youtube/i.test(proofUrl);
      setSubmitResult({
        success: true,
        verification: {
          autoVerified: isVerified,
          confidence: isVerified ? 72 : 25,
          reason: isVerified ? 'URL matches expected platform patterns' : 'URL needs manual review',
        },
      });
      if (isVerified) onPointsEarned(points);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-cyan" /> Bounty Board
          </h2>
          <p className="text-dark-400 mt-1">Complete tasks to earn points and climb the leaderboard.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-dark-400 flex-shrink-0" />
        {types.map((type) => {
          const config = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                filter === type
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30'
                  : 'text-dark-400 bg-dark-700 border border-dark-600 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All Tasks' : config?.label || type}
            </button>
          );
        })}
      </div>

      {/* Task Grid */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => {
          const config = TYPE_CONFIG[task.type] || TYPE_CONFIG.code;
          const isExpanded = expandedTask === task._id;
          return (
            <div
              key={task._id}
              className={`glass-strong rounded-xl overflow-hidden transition-all ${config.border} ${
                isExpanded ? 'ring-1 ring-accent-cyan/20' : ''
              }`}
            >
              <div
                className="p-5 cursor-pointer hover:bg-dark-700/30 transition-all"
                onClick={() => {
                  setExpandedTask(isExpanded ? null : task._id);
                  setProofUrl('');
                  setSubmitResult(null);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <h3 className="font-bold text-white">{task.title}</h3>
                      <p className="text-sm text-dark-400 mt-1 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${DIFFICULTY_BADGE[task.difficulty] || DIFFICULTY_BADGE.medium}`}>
                          {task.difficulty}
                        </span>
                        {task.tags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] text-dark-400 bg-dark-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="text-2xl font-black text-accent-cyan">{task.points}</span>
                    <p className="text-[10px] text-dark-500 uppercase tracking-wider">points</p>
                  </div>
                </div>
              </div>

              {/* Expanded: Submit Proof */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-dark-600 pt-4 animate-fade-in">
                  {submitResult ? (
                    <div className={`flex items-start gap-3 p-4 rounded-lg ${
                      submitResult.verification?.autoVerified
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}>
                      {submitResult.verification?.autoVerified ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-bold text-sm ${
                          submitResult.verification?.autoVerified ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {submitResult.verification?.autoVerified
                            ? `✅ Auto-verified! +${task.points} points earned!`
                            : '⏳ Submitted for manual review'}
                        </p>
                        <p className="text-xs text-dark-400 mt-1">
                          Confidence: {submitResult.verification?.confidence}% — {submitResult.verification?.reason}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                          type="url"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="Paste your proof URL here..."
                          className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-accent-cyan/50 transition-all font-mono"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmit(task._id, task.points)}
                        disabled={submitting || !proofUrl.trim()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-dark-900 font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-40 text-sm"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
