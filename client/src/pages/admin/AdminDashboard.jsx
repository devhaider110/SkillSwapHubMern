import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalyticsOverview } from '../../services/api';
import { Users, BookOpen, RefreshCw, Star, Award, Calendar, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getAnalyticsOverview();
        // The API returns { success: true, data: { ... } }
        setOverview(res.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const statCards = [
    { label: 'Total Users', value: overview?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Teach Skills', value: overview?.totalTeachSkills || 0, icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Learn Skills', value: overview?.totalLearnSkills || 0, icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Swaps', value: overview?.totalSwaps || 0, icon: <RefreshCw className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Completed Swaps', value: overview?.completedSwaps || 0, icon: <Award className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Completion Rate', value: `${overview?.completionRate || 0}%`, icon: <Star className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Sessions', value: overview?.totalSessions || 0, icon: <Calendar className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Reviews', value: overview?.totalReviews || 0, icon: <Star className="w-5 h-5" />, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
        <AlertCircle className="w-12 h-12 mb-4 text-rose-500" />
        <p className="text-rose-600 dark:text-rose-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 mt-4 text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 rounded-xl"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">Manage users, skills, and platform activity.</p>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link to="/admin/users" className="px-4 py-2 text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 rounded-xl">Manage Users</Link>
          <Link to="/admin/skills" className="px-4 py-2 text-white transition shadow-md bg-emerald-600 hover:bg-emerald-700 rounded-xl">Manage Skills</Link>
          <Link to="/admin/swaps" className="px-4 py-2 text-white transition shadow-md bg-amber-600 hover:bg-amber-700 rounded-xl">Manage Swaps</Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className={`p-4 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 ${stat.bg}`}>
              <div className="flex items-center justify-between">
                <span className={stat.color}>{stat.icon}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;