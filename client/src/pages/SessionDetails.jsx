import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSession, updateSessionStatus } from '../services/api';
import { Calendar, Clock, User, Video, ArrowLeft } from 'lucide-react';

const SessionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getSession(id);
        setSession(res.data.session);
      } catch (err) {
        setError('Failed to load session details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleStart = async () => {
    try {
      await updateSessionStatus(id, 'live');
      navigate(`/sessions/${id}/meeting`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    try {
      await updateSessionStatus(id, 'completed');
      // refresh session
      const res = await getSession(id);
      setSession(res.data.session);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        await updateSessionStatus(id, 'cancelled');
        const res = await getSession(id);
        setSession(res.data.session);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading session...</div>;
  if (error) return <div className="p-6 text-center text-rose-500">{error}</div>;
  if (!session) return <div className="p-6 text-center">Session not found</div>;

  const isTeacher = session.teacher?._id === session.teacher?._id; // will use auth later

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/sessions" className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{session.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{session.skill}</p>

          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(session.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{session.time} • {session.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Teacher: {session.teacher?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span>Learner: {session.learner?.name || 'Unknown'}</span>
            </div>
            {session.description && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-sm text-slate-600 dark:text-slate-300">{session.description}</p>
              </div>
            )}
            <div className="mt-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                session.status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                session.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
              }`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {session.status === 'scheduled' && (
              <>
                <button
                  onClick={handleStart}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition"
                >
                  <Video className="w-4 h-4 inline mr-1" /> Start Session
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition"
                >
                  Cancel Session
                </button>
              </>
            )}
            {session.status === 'live' && (
              <Link
                to={`/sessions/${session._id}/meeting`}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow transition"
              >
                <Video className="w-4 h-4 inline mr-1" /> Join Live
              </Link>
            )}
            {session.status === 'live' && (
              <button
                onClick={handleComplete}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
              >
                End Session & Mark Complete
              </button>
            )}
            {session.status === 'completed' && (
              <span className="text-sm text-slate-500 dark:text-slate-400">Session completed. You can now give a review.</span>
            )}
            {session.status === 'cancelled' && (
              <span className="text-sm text-slate-400">This session has been cancelled.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetails;