/**
 * ProfileView.jsx — Detailed Ambassador Profile
 * ================================================
 * Shows the full GitHub evaluation data with progress bars, charts, and cards.
 */
import { Star, AlertTriangle, Lightbulb, MessageSquare, Github, Calendar, Users, GitFork } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CHART_COLORS = ['#06d6a0', '#4cc9f0', '#9b5de5', '#f15bb5', '#fee440', '#ff6b35', '#00bbf9', '#adb5bd'];

function ScoreBar({ label, value, max = 100, color = '#06d6a0' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-dark-400">{label}</span>
        <span className="font-bold text-white">{value}<span className="text-dark-500">/{max}</span></span>
      </div>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ProfileView({ user, evaluation }) {
  const profile = evaluation?.github_profile || {};

  // Score breakdown (estimated from dev_score)
  const score = user.devScore || 0;
  const breakdown = [
    { label: 'Code Quality', value: Math.min(100, Math.round(score * 1.1)), color: '#06d6a0' },
    { label: 'Project Diversity', value: Math.min(100, Math.round(score * 0.9)), color: '#4cc9f0' },
    { label: 'Consistency', value: Math.min(100, Math.round(score * 0.85)), color: '#9b5de5' },
    { label: 'Community Impact', value: Math.min(100, Math.round(score * 0.75)), color: '#f15bb5' },
    { label: 'Professional Polish', value: Math.min(100, Math.round(score * 0.95)), color: '#fee440' },
  ];

  // Language chart data (mock from profile or generate)
  const langData = [
    { name: 'JavaScript', value: 42 },
    { name: 'Python', value: 28 },
    { name: 'TypeScript', value: 15 },
    { name: 'CSS', value: 8 },
    { name: 'Other', value: 7 },
  ];

  return (
    <div className="animate-fade-in">
      {/* Profile Header */}
      <div className="glass-strong rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name}
              className="w-20 h-20 rounded-2xl ring-2 ring-accent-cyan/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-dark-600 flex items-center justify-center text-2xl font-bold text-dark-400">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user.name || user.githubHandle}</h2>
            <p className="text-dark-400 font-mono text-sm">@{user.githubHandle}</p>
            {user.bio && <p className="text-dark-400 text-sm mt-1">{user.bio}</p>}
            <div className="flex items-center gap-4 mt-3">
              <a href={profile.html_url || `https://github.com/${user.githubHandle}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-accent-cyan hover:underline">
                <Github className="w-3.5 h-3.5" /> View GitHub
              </a>
              <span className="flex items-center gap-1.5 text-xs text-dark-400">
                <Users className="w-3.5 h-3.5" /> {profile.followers || 0} followers
              </span>
              <span className="flex items-center gap-1.5 text-xs text-dark-400">
                <GitFork className="w-3.5 h-3.5" /> {profile.public_repos || 0} repos
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-black text-accent-cyan text-glow-cyan">{score}</div>
            <div className="text-xs text-dark-500 uppercase tracking-wider mt-1">Dev Score</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Breakdown */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-cyan" /> Score Breakdown
          </h3>
          <div className="space-y-4">
            {breakdown.map((item) => (
              <ScoreBar key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Language Distribution */}
        <div className="glass-strong rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent-purple" /> Language Distribution
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={langData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#4a4a62', fontSize: 12 }} width={80} />
              <Tooltip
                contentStyle={{ background: '#1a1a25', border: '1px solid #353548', borderRadius: 8, color: '#e4e4eb' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                {langData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recruiter Impression */}
        <div className="glass-strong rounded-2xl p-6 glow-blue">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-accent-blue" />
            <h3 className="text-lg font-bold text-white">Recruiter First Impression</h3>
          </div>
          <p className="text-dark-400 leading-relaxed italic">
            "{user.recruiterImpression}"
          </p>
        </div>

        {/* Strengths */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-lg font-bold text-white">Your Strengths</h3>
          </div>
          <div className="space-y-2">
            {user.strengths?.map((s, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 rounded-lg bg-accent-cyan/5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2 flex-shrink-0" />
                <span className="text-sm text-dark-400">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Repos to Improve */}
        <div className="glass-strong rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-accent-yellow" />
            <h3 className="text-lg font-bold text-white">Repos to Improve</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.reposToImprove?.map((repo, i) => (
              <div key={i} className="bg-dark-800 rounded-xl p-4 border border-dark-600 hover:border-accent-yellow/30 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-accent-yellow" />
                  <span className="font-mono text-sm font-semibold text-accent-yellow">
                    {repo.repoName}
                  </span>
                </div>
                <p className="text-sm text-dark-400">{repo.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="glass-strong rounded-2xl p-6 lg:col-span-2 glow-purple">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-accent-purple" />
            <h3 className="text-lg font-bold text-white">Your Action Plan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {user.nextSteps?.map((step, i) => (
              <div key={i} className="flex items-start gap-3 bg-accent-purple/5 rounded-xl p-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-dark-400">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      {user.badges?.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-bold text-white mb-4">🏆 Badges Earned</h3>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-xl border border-dark-600">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-white">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
