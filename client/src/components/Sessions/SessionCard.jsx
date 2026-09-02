import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Video, CheckCircle, XCircle } from 'lucide-react';

const SessionCard = ({ session }) => {
  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    live: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  };

  const statusIcons = {
    scheduled: <Clock className="w-4 h-4" />,
    live: <Video className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
  };

  return (
    <div className="p-5 transition bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{session.title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[session.status]}`}>
          {statusIcons[session.status]}
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{session.skill}</p>

      <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date(session.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{session.time} • {session.duration} min</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>Teacher: {session.teacher?.name || 'Unknown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <span>Learner: {session.learner?.name || 'Unknown'}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {session.status === 'scheduled' && (
          <>
            <Link
              to={`/sessions/${session._id}`}
              className="flex-1 px-4 py-2 text-sm font-medium text-center text-white transition bg-indigo-600 shadow hover:bg-indigo-700 rounded-xl"
            >
              View Details
            </Link>
            <button
              onClick={() => alert('Join meeting coming soon!')}
              className="flex-1 px-4 py-2 text-sm font-medium text-white transition shadow bg-emerald-600 hover:bg-emerald-700 rounded-xl"
            >
              <Video className="inline w-4 h-4 mr-1" /> Join
            </button>
          </>
        )}
        {session.status === 'live' && (
          <Link
            to={`/sessions/${session._id}/meeting`}
            className="w-full px-4 py-2 text-sm font-medium text-center text-white transition shadow bg-emerald-600 hover:bg-emerald-700 rounded-xl"
          >
            <Video className="inline w-4 h-4 mr-1" /> Join Live
          </Link>
        )}
        {session.status === 'completed' && (
          <Link
            to={`/sessions/${session._id}`}
            className="w-full px-4 py-2 text-sm font-medium text-center transition bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300"
          >
            View Summary
          </Link>
        )}
        {session.status === 'cancelled' && (
          <span className="w-full px-4 py-2 text-sm text-center text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl">Cancelled</span>
        )}
      </div>
    </div>
  );
};

export default SessionCard;