import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizzes } from '../services/api';
import { PlusCircle, FileText, Clock, Users } from 'lucide-react';

const Quizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await getQuizzes();
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 rounded-full animate-spin border-t-indigo-600 border-slate-200" />
          <p className="text-slate-600 dark:text-slate-300">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Quizzes</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create and attempt quizzes to test your knowledge.</p>
          </div>
          <Link
            to="/quizzes/create"
            className="inline-flex items-center gap-2 px-4 py-2 text-white transition bg-indigo-600 shadow hover:bg-indigo-700 rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            Create Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-12 text-center bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No quizzes yet</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create your first quiz or wait for others.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="p-5 transition bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{quiz.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {quiz.description || 'No description'}
                    </p>
                  </div>
                  {quiz.hasAttempted && (
                    <span className="px-2 py-0.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full dark:bg-emerald-900/30 dark:text-emerald-300">
                      Attempted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {quiz.timeLimit} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {quiz.attempts?.length || 0} attempts
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  {quiz.createdBy?._id === user?._id ? (
                    <Link
                      to={`/quizzes/${quiz._id}/results`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center text-indigo-600 transition border border-indigo-200 rounded-xl dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      Results
                    </Link>
                  ) : (
                    <Link
                      to={`/quizzes/${quiz._id}/take`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center text-white transition bg-indigo-600 shadow rounded-xl hover:bg-indigo-700"
                    >
                      {quiz.hasAttempted ? 'Retake' : 'Take Quiz'}
                    </Link>
                  )}
                  <Link
                    to={`/quizzes/${quiz._id}`}
                    className="px-3 py-2 text-sm font-medium text-center transition border text-slate-600 border-slate-200 rounded-xl dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;