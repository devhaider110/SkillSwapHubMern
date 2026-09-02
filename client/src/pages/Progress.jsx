import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProgressOverview,
  getSkillProgress,
  getWeeklyActivity,
} from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Zap,
} from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [skillProgress, setSkillProgress] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, skillRes, weeklyRes] = await Promise.all([
          getProgressOverview(),
          getSkillProgress(),
          getWeeklyActivity(),
        ]);
        setOverview(overviewRes.data.data);
        setSkillProgress(skillRes.data.progress);
        setWeeklyActivity(weeklyRes.data.activity);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full animate-spin border-t-indigo-600 border-slate-200" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-800 dark:text-white">My Learning Progress</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Track your skill mastery and activity.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{overview?.hoursLearned || 0}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hours Learned</p>
          </div>
          <div className="p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{overview?.hoursTaught || 0}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hours Taught</p>
          </div>
          <div className="p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{overview?.completedSwaps || 0}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Swaps Completed</p>
          </div>
          <div className="p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-rose-600" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{overview?.streak || 0}🔥</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Day Streak</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          {/* Skill Progress */}
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-800 dark:text-white">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Skill Mastery
            </h2>
            {skillProgress.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
            ) : (
              <div className="space-y-3">
                {skillProgress.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {skill.skillName} ({skill.type})
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{skill.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          skill.type === 'teach'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        }`}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Activity Chart */}
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-800 dark:text-white">
              <Calendar className="w-5 h-5 text-amber-600" /> Weekly Activity
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-800 dark:text-white">
            <Zap className="w-5 h-5 text-rose-500" /> Recent Activity
          </h2>
          {overview?.recentActivity?.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {overview?.recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-slate-200/50 dark:border-slate-700/50 rounded-xl"
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{act.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {act.type === 'quiz' ? `Score: ${act.score}% ${act.passed ? '✅' : '❌'}` : ''}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(act.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;