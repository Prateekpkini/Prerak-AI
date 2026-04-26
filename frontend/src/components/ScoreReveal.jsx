/**
 * ScoreReveal.jsx — Animated Score Reveal Screen
 * ================================================
 * Beautiful reveal animation showing the dev score, strengths,
 * recruiter impression, repo feedback, and next steps.
 */
import { useState, useEffect } from 'react';
import { ArrowRight, Star, AlertTriangle, Lightbulb, MessageSquare, TrendingUp } from 'lucide-react';

function ScoreRing({ score, size = 180, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const getColor = () => {
    if (score >= 75) return '#06d6a0';
    if (score >= 50) return '#4cc9f0';
    if (score >= 30) return '#fee440';
    return '#f15bb5';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          className="score-ring-bg" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={getColor()} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="score-ring-fill" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white">{score}</span>
        <span className="text-sm text-dark-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

export default function ScoreReveal({ evaluation, username, onContinue }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDetails(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const scoreLabel =
    evaluation.dev_score >= 75 ? 'Excellent' :
    evaluation.dev_score >= 50 ? 'Promising' :
    evaluation.dev_score >= 30 ? 'Growing' : 'Getting Started';

  const scoreLabelColor =
    evaluation.dev_score >= 75 ? 'text-accent-cyan' :
    evaluation.dev_score >= 50 ? 'text-accent-blue' :
    evaluation.dev_score >= 30 ? 'text-accent-yellow' : 'text-accent-pink';

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Score Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            {evaluation.github_profile?.avatar_url && (
              <img src={evaluation.github_profile.avatar_url} alt={username}
                className="w-12 h-12 rounded-full ring-2 ring-accent-cyan/30" />
            )}
            <div className="text-left">
              <h2 className="text-xl font-bold text-white">
                {evaluation.github_profile?.name || username}
              </h2>
              <p className="text-sm text-dark-400 font-mono">@{username}</p>
            </div>
          </div>

          <ScoreRing score={evaluation.dev_score} />
          <p className={`text-2xl font-bold mt-4 ${scoreLabelColor}`}>{scoreLabel}</p>
          <p className="text-dark-400 text-sm mt-1">Recruiter Readiness Score</p>
        </div>

        {showDetails && (
          <div className="space-y-6 animate-fade-in-up">
            {/* First Impression */}
            <div className="glass-strong rounded-2xl p-6 glow-blue">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-accent-blue" />
                <h3 className="text-lg font-bold text-white">Recruiter First Impression</h3>
              </div>
              <p className="text-dark-400 leading-relaxed italic">
                "{evaluation.recruiter_first_impression}"
              </p>
            </div>

            {/* Strengths */}
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-lg font-bold text-white">Your Strengths</h3>
              </div>
              <div className="grid gap-2">
                {evaluation.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5 rounded-lg bg-accent-cyan/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2 flex-shrink-0" />
                    <span className="text-sm text-dark-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Repos to Improve */}
            <div className="glass-strong rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-accent-yellow" />
                <h3 className="text-lg font-bold text-white">Repos to Improve</h3>
              </div>
              <div className="grid gap-3">
                {evaluation.repos_to_improve.map((repo, i) => (
                  <div key={i} className="bg-dark-800 rounded-xl p-4 border border-dark-600">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-semibold text-accent-yellow">
                        {repo.repo_name}
                      </span>
                    </div>
                    <p className="text-sm text-dark-400">{repo.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="glass-strong rounded-2xl p-6 glow-purple">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-accent-purple" />
                <h3 className="text-lg font-bold text-white">Your Action Plan</h3>
              </div>
              <div className="space-y-3">
                {evaluation.next_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-dark-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4 pb-8">
              <button
                onClick={onContinue}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-cyan to-accent-blue text-dark-900 font-bold rounded-xl hover:opacity-90 transition-all text-lg animate-pulse-glow"
              >
                <TrendingUp className="w-5 h-5" />
                Enter Ambassador Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-dark-500 text-xs mt-3">
                Complete tasks, earn points, and climb the leaderboard
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
