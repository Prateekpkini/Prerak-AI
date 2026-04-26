/**
 * GitHubAnalyzer.jsx — The "2-Minute AI Onboarding" Screen
 * ==========================================================
 * Hero screen where users enter their GitHub handle to get an AI-powered
 * profile evaluation. Includes animated loading states and score reveal.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Sparkles, ArrowRight, Loader2, Brain, Target, Zap, AlertCircle } from 'lucide-react';
import { analyzeGitHub } from '../api';
import ScoreReveal from './ScoreReveal';

const LOADING_STEPS = [
  { text: 'Fetching repositories & commits...', icon: Github },
  { text: 'Analyzing language distribution...', icon: Brain },
  { text: 'Evaluating recruiter readiness...', icon: Target },
  { text: 'Generating personalized insights...', icon: Sparkles },
];

export default function GitHubAnalyzer({ onComplete }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    const handle = username.trim().replace('@', '');
    if (!handle) return;

    setError('');
    setLoading(true);
    setLoadingStep(0);
    setEvaluation(null);

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 1500);

    try {
      const data = await analyzeGitHub(handle);
      clearInterval(stepInterval);
      setEvaluation(data);
    } catch (err) {
      clearInterval(stepInterval);
      const msg = err.response?.data?.detail || err.message || 'Analysis failed';
      setError(msg);
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    const mockUser = {
      _id: 'demo_' + Date.now(),
      githubHandle: username.trim().toLowerCase(),
      name: evaluation.github_profile?.name || username,
      avatarUrl: evaluation.github_profile?.avatar_url || '',
      bio: evaluation.github_profile?.bio || '',
      devScore: evaluation.dev_score,
      strengths: evaluation.strengths,
      recruiterImpression: evaluation.recruiter_first_impression,
      reposToImprove: evaluation.repos_to_improve.map((r) => ({
        repoName: r.repo_name,
        feedback: r.feedback,
      })),
      nextSteps: evaluation.next_steps,
      totalPoints: 0,
      currentStreak: 0,
      badges: [{ name: 'Early Adopter', icon: '🌟' }],
      completedTasks: [],
    };
    onComplete(mockUser, evaluation);
    navigate('/dashboard');
  };

  // ── Score Reveal Screen ────────────────────────────────────────────
  if (evaluation) {
    return (
      <ScoreReveal
        evaluation={evaluation}
        username={username}
        onContinue={handleContinueToDashboard}
      />
    );
  }

  // ── Main Onboarding Screen ─────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero Header */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-accent-cyan text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          AI-Powered Developer Evaluation
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          <span className="text-white">Doot</span>{' '}
          <span className="bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-purple bg-clip-text text-transparent">
            Setu
          </span>
        </h1>
        <p className="text-lg md:text-xl text-dark-400 max-w-xl mx-auto leading-relaxed">
          Your GitHub profile analyzed by AI in under 2 minutes.
          <br />
          <span className="text-white/70">Discover your recruiter readiness score.</span>
        </p>
      </div>

      {/* Input Card */}
      <div
        className="w-full max-w-lg glass-strong rounded-2xl p-8 glow-cyan"
        style={{ animationDelay: '0.2s', animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
      >
        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label htmlFor="github-handle" className="block text-sm font-medium text-dark-400 mb-2">
              GitHub Username
            </label>
            <div className="relative">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                id="github-handle"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. torvalds"
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-all font-mono text-lg disabled:opacity-50"
                autoComplete="off"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze My Profile
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Loading Progress */}
        {loading && (
          <div className="mt-8 space-y-3 animate-fade-in">
            {LOADING_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isActive = i === loadingStep;
              const isDone = i < loadingStep;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${
                    isActive
                      ? 'bg-accent-cyan/10 text-accent-cyan'
                      : isDone
                      ? 'text-dark-400'
                      : 'text-dark-600'
                  }`}
                >
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                    </div>
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">{step.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Pills */}
      <div
        className="flex flex-wrap justify-center gap-3 mt-10 max-w-lg"
        style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
      >
        {['No Forms', 'AI Scoring', 'Repo Feedback', 'Action Plan'].map((label) => (
          <span
            key={label}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-dark-400 border border-dark-600 bg-dark-800/50"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
