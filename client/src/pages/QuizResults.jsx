import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizResults } from '../services/api';
import { CheckCircle, XCircle, BarChart2 } from 'lucide-react';

const QuizResults = () => {
  const { quizId, attemptId } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getQuizResults(quizId, attemptId);
        setResult(res.data.attempt);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId, attemptId]);

  if (loading) return <div className="p-6 text-center">Loading results...</div>;
  if (error) return <div className="p-6 text-center text-rose-500">{error}</div>;
  if (!result) return <div className="p-6 text-center">No results found.</div>;

  const passed = result.passed;
  const score = result.score;
  const totalPoints = result.totalPoints;
  const earnedPoints = result.earnedPoints;

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{result.quiz?.title} – Results</h1>
            <div className={`text-lg font-bold ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
              {passed ? '✅ Passed' : '❌ Failed'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 mb-6 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{score}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Points</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{earnedPoints} / {totalPoints}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Taken</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.timeTaken}s</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Passing Score</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.quiz?.passingScore || 50}%</p>
            </div>
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-white">Answers</h2>
          <div className="space-y-4">
            {result.answers.map((ans, idx) => (
              <div key={idx} className="p-4 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">Q{idx+1}: {ans.question?.text || 'Question'}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Your answer: {ans.selectedAnswer !== undefined && ans.selectedAnswer !== null ? String(ans.selectedAnswer) : 'Not answered'}
                    </p>
                    {ans.isCorrect !== undefined && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        {ans.isCorrect ? (
                          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> Correct</span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-600"><XCircle className="w-3.5 h-3.5" /> Incorrect</span>
                        )}
                        {ans.question?.correctAnswer && (
                          <span className="text-slate-400">(Correct: {String(ans.question.correctAnswer)})</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{ans.pointsEarned || 0} pts</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Link
              to="/quizzes"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              Back to Quizzes
            </Link>
            <Link
              to={`/quizzes/${quizId}`}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition"
            >
              View Quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;