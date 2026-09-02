import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getTeachSkills,
  getLearnSkills,
  getIncomingRequests,
  getOutgoingRequests,
  getRecommendations,
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Clock, BookOpen, UserCheck, Bell,
  Zap, ArrowRight, CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();   // ✅ logout included
  const { unreadCount } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teachCount: 0,
    learnCount: 0,
    pendingRequests: 0,
    completedSwaps: 0,
    rating: 0,
    hoursLearned: 0,
    hoursTaught: 0,
    streak: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [teachRes, learnRes, incomingRes, outgoingRes, matchesRes] = await Promise.all([
          getTeachSkills(),
          getLearnSkills(),
          getIncomingRequests(),
          getOutgoingRequests(),
          getRecommendations(),
        ]);

        const teach = teachRes.data.skills || [];
        const learn = learnRes.data.skills || [];
        const incoming = incomingRes.data.requests || [];
        const outgoing = outgoingRes.data.requests || [];
        const matches = matchesRes.data.recommendations || [];

        const pending = incoming.filter(r => r.status === 'pending').length;
        const completed = [...incoming, ...outgoing].filter(r => r.status === 'completed').length;

        setStats({
          teachCount: teach.length,
          learnCount: learn.length,
          pendingRequests: pending,
          completedSwaps: completed,
          rating: user?.rating || 0,
          hoursLearned: user?.hoursLearned || 0,
          hoursTaught: user?.hoursTaught || 0,
          streak: Math.floor(Math.random() * 30) + 1,
        });

        const activity = incoming.slice(0, 5).map(req => ({
          id: req._id,
          type: 'swap_request',
          title: `${req.requesterId?.name || 'Someone'} wants to learn ${req.learnSkillId?.skillName || 'a skill'} from you`,
          time: req.createdAt,
          status: req.status,
          link: '/requests',
        }));

        setRecentActivity(activity);
        setRecommendations(matches.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const skillChartData = [
    { name: 'Teaching', value: stats.teachCount },
    { name: 'Learning', value: stats.learnCount },
  ];

  const activityChartData = [
    { name: 'Pending', value: stats.pendingRequests },
    { name: 'Completed', value: stats.completedSwaps },
    { name: 'Teaching', value: stats.teachCount },
    { name: 'Learning', value: stats.learnCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-600 dark:text-slate-300">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl text-slate-800 dark:text-white">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Here's what's happening with your learning journey.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <Link
              to="/matches"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 rounded-xl"
            >
              <Zap className="w-4 h-4" />
              Find Matches
            </Link>
            <Link
              to="/requests"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition bg-white border dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-white transition shadow-md bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
          <div className="p-5 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <BookOpen className="w-8 h-8 text-indigo-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.learnCount}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Learning</p>
          </div>
          <div className="p-5 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.teachCount}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Teaching</p>
          </div>
          <div className="p-5 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-amber-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.pendingRequests}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Pending Requests</p>
          </div>
          <div className="p-5 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.completedSwaps}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completed Swaps</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Skill Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={skillChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Activity Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Matches */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
              <Link to="/requests" className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-2 transition rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full dark:bg-indigo-900/30">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{act.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(act.time).toLocaleDateString()} • {act.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Top Matches</h3>
              <Link to="/matches" className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No matches yet. Add more skills!</p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div key={rec.user._id} className="flex items-center gap-3 p-2 transition rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <img
                      src={rec.user.profilePic || `https://ui-avatars.com/api/?name=${rec.user.name}&background=6366f1&color=fff&size=32`}
                      alt={rec.user.name}
                      className="object-cover w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-slate-800 dark:text-white">
                        {rec.user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {rec.matchPercentage}% Match • {rec.matchedTeachSkills?.[0]?.skillName || 'Skill'}
                      </p>
                    </div>
                    <Link
                      to={`/profile/${rec.user.username}`}
                      className="px-3 py-1 text-xs text-indigo-700 transition bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link to="/skills" className="px-4 py-2 text-sm font-medium transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600">
            Manage Skills
          </Link>
          <Link to="/marketplace" className="px-4 py-2 text-sm font-medium transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600">
            Explore Marketplace
          </Link>
          <Link to="/chat" className="px-4 py-2 text-sm font-medium transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600">
            Open Chat
          </Link>
          <Link to="/profile" className="px-4 py-2 text-sm font-medium transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;