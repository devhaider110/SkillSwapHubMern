import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOutgoingRequests, createSession } from '../services/api';

const ScheduleSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    swapRequestId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getOutgoingRequests();
        // Filter accepted requests
        const accepted = res.data.requests.filter(r => r.status === 'accepted');
        setRequests(accepted);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch accepted swap requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await createSession(formData);
      navigate(`/sessions/${res.data.session._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule session');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">Schedule Learning Session</h1>

        {requests.length === 0 && (
          <div className="p-8 text-center bg-white border dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400">No accepted swap requests available to schedule sessions.</p>
          </div>
        )}

        {requests.length > 0 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            {error && <div className="text-sm text-rose-500">{error}</div>}

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Swap Request</label>
              <select
                name="swapRequestId"
                value={formData.swapRequestId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Select a swap request</option>
                {requests.map((req) => (
                  <option key={req._id} value={req._id}>
                    {req.teachSkillId?.skillName || 'Skill'} with {req.receiverId?.name || 'user'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Java Basics"
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Describe what you'll learn..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="15"
                max="180"
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              Schedule Session
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ScheduleSession;