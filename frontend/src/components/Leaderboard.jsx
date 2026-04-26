/**
 * Leaderboard.jsx — Real-time Leaderboard Component
 * ===================================================
 */
import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Flame, TrendingUp } from 'lucide-react';
import { getLeaderboard } from '../api';

// Demo leaderboard when backend isn't connected
const DEMO_LEADERBOARD = [
  { githubHandle: 'priya-dev', name: 'Priya Sharma', totalPoints: 1250, devScore: 82, currentStreak: 6, badges: [{ icon: '👑' }, { icon: '🔥' }] },
  { githubHandle: 'arjun-codes', name: 'Arjun Patel', totalPoints: 980, devScore: 74, currentStreak: 4, badges: [{ icon: '⚡' }] },
  { githubHandle: 'sneha-tech', name: 'Sneha Gupta', totalPoints: 850, devScore: 68, currentStreak: 3, badges: [{ icon: '💯' }] },
  { githubHandle: 'rahul-hacks', name: 'Rahul Kumar', totalPoints: 720, devScore: 71, currentStreak: 5, badges: [{ icon: '🔥' }] },
  { githubHandle: 'ananya-build', name: 'Ananya Singh', totalPoints: 650, devScore: 65, currentStreak: 2, badges: [{ icon: '🌟' }] },
  { githubHandle: 'vikram-js', name: 'Vikram Reddy', totalPoints: 520, devScore: 59, currentStreak: 1, badges: [] },
  { githubHandle: 'meera-oss', name: 'Meera Iyer', totalPoints: 480, devScore: 63, currentStreak: 3, badges: [{ icon: '🌟' }] },
  { githubHandle: 'karan-dev', name: 'Karan Malhotra', totalPoints: 350, devScore: 55, currentStreak: 1, badges: [] },
];

const RANK_STYLES = [
  { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/30' },
  { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-400/10', ring: 'ring-gray-400/30' },
  { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', ring: 'ring-amber-600/30' },
];

export default function Leaderboard({ currentUser }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getLeaderboard();
        const list = data.leaderboard?.length ? data.leaderboard : DEMO_LEADERBOARD;
        // Inject current user if not present
        if (currentUser && !list.some((l) => l.githubHandle === currentUser.githubHandle)) {
          list.push({
            githubHandle: currentUser.githubHandle,
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
            totalPoints: currentUser.totalPoints,
            devScore: currentUser.devScore,
            currentStreak: currentUser.currentStreak,
            badges: currentUser.badges || [],
          });
          list.sort((a, b) => b.totalPoints - a.totalPoints);
        }
        setLeaders(list);
      } catch {
        const list = [...DEMO_LEADERBOARD];
        if (currentUser) {
          list.push({
            githubHandle: currentUser.githubHandle,
            name: currentUser.name,
            totalPoints: currentUser.totalPoints,
            devScore: currentUser.devScore,
            currentStreak: currentUser.currentStreak,
            badges: currentUser.badges || [],
          });
          list.sort((a, b) => b.totalPoints - a.totalPoints);
        }
        setLeaders(list);
      }
    })();
  }, [currentUser]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-accent-yellow" /> Leaderboard
        </h2>
        <p className="text-dark-400 mt-1">Top ambassadors ranked by total points earned.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {leaders.slice(0, 3).map((leader, i) => {
          const style = RANK_STYLES[i];
          const RankIcon = style.icon;
          const isCurrentUser = leader.githubHandle === currentUser?.githubHandle;
          return (
            <div
              key={leader.githubHandle}
              className={`glass-strong rounded-2xl p-6 text-center relative ${
                i === 0 ? 'ring-1 ' + style.ring : ''
              } ${isCurrentUser ? 'ring-1 ring-accent-cyan/40' : ''}`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${style.bg} mb-3`}>
                <RankIcon className={`w-5 h-5 ${style.color}`} />
              </div>
              <div className="w-16 h-16 mx-auto rounded-full bg-dark-600 flex items-center justify-center text-xl font-bold text-dark-400 mb-3 ring-2 ring-dark-500">
                {leader.avatarUrl ? (
                  <img src={leader.avatarUrl} alt={leader.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  leader.name?.[0]?.toUpperCase() || '?'
                )}
              </div>
              <h4 className="font-bold text-white text-sm truncate">{leader.name || leader.githubHandle}</h4>
              <p className="text-[11px] text-dark-500 font-mono mb-2">@{leader.githubHandle}</p>
              <p className={`text-2xl font-black ${style.color}`}>{leader.totalPoints}</p>
              <p className="text-[10px] text-dark-500 uppercase tracking-wider">points</p>
              {isCurrentUser && (
                <span className="absolute top-3 right-3 text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded">
                  YOU
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Rankings Table */}
      <div className="glass-strong rounded-xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-5 py-3 border-b border-dark-600 text-xs text-dark-500 uppercase tracking-wider font-medium">
          <span>Rank</span>
          <span>Ambassador</span>
          <span className="text-right">Points</span>
          <span className="text-right">Dev Score</span>
          <span className="text-right">Streak</span>
        </div>

        {leaders.map((leader, i) => {
          const isCurrentUser = leader.githubHandle === currentUser?.githubHandle;
          return (
            <div
              key={leader.githubHandle}
              className={`grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-5 py-3.5 items-center border-b border-dark-700/50 transition-all hover:bg-dark-700/30 ${
                isCurrentUser ? 'bg-accent-cyan/5' : ''
              }`}
            >
              <span className={`font-bold text-sm ${i < 3 ? RANK_STYLES[i].color : 'text-dark-400'}`}>
                #{i + 1}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-dark-400 flex-shrink-0">
                  {leader.avatarUrl ? (
                    <img src={leader.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    leader.name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {leader.name || leader.githubHandle}
                    {isCurrentUser && <span className="ml-2 text-[10px] text-accent-cyan">(you)</span>}
                  </p>
                  <p className="text-[11px] text-dark-500 font-mono truncate">@{leader.githubHandle}</p>
                </div>
                <div className="flex gap-1 ml-auto">
                  {leader.badges?.slice(0, 3).map((b, j) => (
                    <span key={j} className="text-sm">{b.icon}</span>
                  ))}
                </div>
              </div>
              <span className="text-right font-bold text-white text-sm">{leader.totalPoints}</span>
              <span className="text-right text-sm text-accent-cyan">{leader.devScore}</span>
              <span className="text-right text-sm flex items-center justify-end gap-1">
                <Flame className="w-3 h-3 text-accent-orange" />
                <span className="text-dark-400">{leader.currentStreak}w</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
