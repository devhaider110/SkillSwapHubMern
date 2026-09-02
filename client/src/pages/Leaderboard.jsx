import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { Crown, Star, TrendingUp, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const [type, setType] = useState('mentors');
  const [period, setPeriod] = useState('alltime');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await getLeaderboard(type, period);
        setLeaderboard(res.data.leaderboard);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [type, period]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="flex items-center justify-center w-6 h-6 text-sm font-medium text-slate-500 dark:text-slate-400">#{rank}</span>;
  };

  const typeTabs = [
    { id: 'mentors', label: 'Top Mentors', icon: <Star className="w-4 h-4" /> },
    { id: 'learners', label: 'Top Learners', icon: <Award className="w-4 h-4" /> },
    { id: 'active', label: 'Most Active', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const periodOptions = [
    { value: 'alltime', label: 'All Time' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-24 md:p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">🏆 Leaderboard</h1>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                type === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                period === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Leaderboard List */}
        {leaderboard.length === 0 ? (
          <div className="py-12 text-center bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400">No data available for this period.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-4 transition bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-10 text-center">
                  {getRankIcon(user.rank)}
                </div>

                {/* Avatar */}
                <img
                  src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=48`}
                  alt={user.name}
                  className="object-cover w-12 h-12 border-2 rounded-full border-slate-200 dark:border-slate-600"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate text-slate-800 dark:text-white">
                      {user.name}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {user.rating ? user.rating.toFixed(1) : 'New'}
                    </span>
                    <span>•</span>
                    <span>{user.totalSwaps || user.completedSwaps || 0} swaps</span>
                    {type === 'mentors' && (
                      <>
                        <span>•</span>
                        <span>📖 {user.hoursTaught || 0}h taught</span>
                      </>
                    )}
                    {type === 'learners' && (
                      <>
                        <span>•</span>
                        <span>📚 {user.hoursLearned || 0}h learned</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badge for Top 3 */}
                {user.rank <= 3 && (
                  <div className="flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      user.rank === 2 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      #{user.rank}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;