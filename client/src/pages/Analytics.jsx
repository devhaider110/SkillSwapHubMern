import { useState, useEffect } from 'react';
import {
  getAnalyticsOverview,
  getSkillDistribution,
  getSwapActivity,
  getLearningHours,
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Users, BookOpen, RefreshCw, Star, Calendar, Award } from 'lucide-react';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [skills, setSkills] = useState([]);
  const [swapActivity, setSwapActivity] = useState([]);
  const [learningHours, setLearningHours] = useState({ taught: 0, learned: 0 });
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [overviewRes, skillsRes, activityRes, hoursRes] = await Promise.all([
          getAnalyticsOverview(),
          getSkillDistribution(),
          getSwapActivity(period),
          getLearningHours(),
        ]);
        setOverview(overviewRes.data.data);
        setSkills(skillsRes.data.skills);
        setSwapActivity(activityRes.data.data);
        setLearningHours(hoursRes.data.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Loading analytics...</div>
      </div>
    );
  }

  const statsCards = overview ? [
    { label: 'Total Users', value: overview.totalUsers, icon: <Users className="w-5 h-5" />, color: 'text-indigo-600' },
    { label: 'Teach Skills', value: overview.totalTeachSkills, icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600' },
    { label: 'Learn Skills', value: overview.totalLearnSkills, icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600' },
    { label: 'Total Swaps', value: overview.totalSwaps, icon: <RefreshCw className="w-5 h-5" />, color: 'text-amber-600' },
    { label: 'Completed Swaps', value: overview.completedSwaps, icon: <Award className="w-5 h-5" />, color: 'text-emerald-600' },
    { label: 'Completion Rate', value: `${overview.completionRate}%`, icon: <Star className="w-5 h-5" />, color: 'text-yellow-600' },
    { label: 'Sessions', value: overview.totalSessions, icon: <Calendar className="w-5 h-5" />, color: 'text-purple-600' },
    { label: 'Reviews', value: overview.totalReviews, icon: <Star className="w-5 h-5" />, color: 'text-rose-600' },
  ] : [];

  return (
    <div className="min-h-screen p-4 pt-24 md:p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">📊 Analytics Dashboard</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          {statsCards.map((stat, idx) => (
            <div key={idx} className="p-4 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className={`${stat.color}`}>{stat.icon}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Period filter for activity */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPeriod('day')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              period === 'day' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              period === 'week' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              period === 'month' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Swap Activity (Line Chart) */}
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Swap Activity</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={swapActivity}>
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#4F46E5" name="Total" />
                <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Distribution (Bar Chart) */}
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Top Skills</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skills}>
                <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Learning Hours */}
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Learning Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 text-center bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{learningHours.taught}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hours Taught</p>
              </div>
              <div className="p-4 text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{learningHours.learned}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hours Learned</p>
              </div>
            </div>
          </div>

          {/* Completion Rate Pie Chart */}
          {overview && (
            <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
              <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Completion Rate</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: overview.completedSwaps },
                      { name: 'Pending', value: overview.totalSwaps - overview.completedSwaps },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Completed', value: overview.completedSwaps },
                      { name: 'Pending', value: overview.totalSwaps - overview.completedSwaps },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;