/**
 * Dashboard.jsx — Ambassador Dashboard (Gamified View)
 * =====================================================
 * Main dashboard showing profile summary, task board, stats, and leaderboard.
 */
import { useState } from 'react';
import {
  Trophy, Flame, Target, Star, ChevronRight,
  LayoutDashboard, ListTodo, Users, User,
} from 'lucide-react';
import ProfileView from './ProfileView';
import TaskBoard from './TaskBoard';
import Leaderboard from './Leaderboard';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Bounty Board', icon: ListTodo },
  { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div className="glass-strong rounded-xl p-5 hover:border-white/10 transition-all group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 mb-1">{label}</p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
          {subtext && <p className="text-xs text-dark-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-lg bg-dark-700 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ user, evaluation }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [localUser, setLocalUser] = useState(user);

  const handlePointsUpdate = (points) => {
    setLocalUser((prev) => ({ ...prev, totalPoints: prev.totalPoints + points }));
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-64 glass-strong border-r border-dark-600 p-6 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue flex items-center justify-center">
            <Target className="w-5 h-5 text-dark-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Doot Setu</h1>
            <p className="text-[11px] text-dark-500 -mt-0.5">Ambassador Portal</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User Mini Card */}
        <div className="mt-auto pt-6 border-t border-dark-600">
          <div className="flex items-center gap-3">
            {localUser.avatarUrl ? (
              <img src={localUser.avatarUrl} alt={localUser.name}
                className="w-9 h-9 rounded-full ring-1 ring-dark-500" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-dark-400">
                {localUser.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{localUser.name}</p>
              <p className="text-[11px] text-dark-500 font-mono truncate">@{localUser.githubHandle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 ml-64 p-8">
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome back, {localUser.name?.split(' ')[0] || localUser.githubHandle} 👋
                </h2>
                <p className="text-dark-400 mt-1">Here's your ambassador progress at a glance.</p>
              </div>
              <div className="flex items-center gap-2">
                {localUser.badges?.map((badge, i) => (
                  <span key={i} className="text-xl" title={badge.name}>{badge.icon}</span>
                ))}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Star} label="Dev Score" value={localUser.devScore}
                color="text-accent-cyan" subtext="Recruiter readiness" />
              <StatCard icon={Trophy} label="Total Points" value={localUser.totalPoints}
                color="text-accent-yellow" subtext="From completed tasks" />
              <StatCard icon={Flame} label="Current Streak" value={`${localUser.currentStreak}w`}
                color="text-accent-orange" subtext="Consecutive weeks" />
              <StatCard icon={Target} label="Tasks Done" value={localUser.completedTasks?.length || 0}
                color="text-accent-purple" subtext="Bounties completed" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-accent-orange" /> Quick Tasks
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Write a tech blog post', pts: 150, type: 'blog' },
                    { label: 'Share on social media', pts: 75, type: 'social' },
                    { label: 'Review a PR on GitHub', pts: 100, type: 'code' },
                  ].map((task, i) => (
                    <div key={i}
                      onClick={() => setActiveTab('tasks')}
                      className={`task-${task.type} flex items-center justify-between px-4 py-3 rounded-lg bg-dark-800 hover:bg-dark-700 cursor-pointer transition-all`}
                    >
                      <span className="text-sm text-white">{task.label}</span>
                      <span className="text-xs font-bold text-accent-cyan">+{task.pts} pts</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="w-full mt-4 text-center text-sm text-accent-cyan hover:underline"
                >
                  View all tasks →
                </button>
              </div>

              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-cyan" /> Your Strengths
                </h3>
                <div className="space-y-2">
                  {localUser.strengths?.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5 rounded-lg bg-accent-cyan/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan mt-2 flex-shrink-0" />
                      <span className="text-sm text-dark-400">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskBoard user={localUser} onPointsEarned={handlePointsUpdate} />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard currentUser={localUser} />
        )}

        {activeTab === 'profile' && (
          <ProfileView user={localUser} evaluation={evaluation} />
        )}
      </main>
    </div>
  );
}
