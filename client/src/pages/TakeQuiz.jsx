import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuiz, submitQuiz } from '../services/api';
import { Clock, AlertCircle } from 'lucide-react';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await getQuiz(id);
        setQuiz(res.data.quiz);
        setTimeLeft(res.data.quiz.timeLimit * 60);
      } catch (err) {
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Submit your answers?')) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })),
        timeTaken: quiz.timeLimit * 60 - timeLeft,
      };
      const res = await submitQuiz(id, payload);
      navigate(`/quizzes/${id}/results/${res.data.attempt._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading quiz...</div>;
  if (error) return <div className="p-6 text-center text-rose-500">{error}</div>;
  if (!quiz) return <div className="p-6 text-center">Quiz not found.</div>;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCreator = quiz.isCreator;

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{quiz.title}</h1>
            <div className="flex items-center gap-2 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          {quiz.description && <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{quiz.description}</p>}

          {isCreator && (
            <div className="p-3 mb-4 text-sm border text-amber-700 bg-amber-50 border-amber-200 rounded-xl dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
              You are the creator – you can view answers while taking the quiz.
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {quiz.questions.map((q, idx) => (
              <div key={q._id} className="p-4 mb-6 border border-slate-200/50 dark:border-slate-700/50 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  Q{idx+1}: {q.text}
                </h3>
                <div className="mt-2 space-y-2">
                  {q.type === 'mcq' && q.options.map((opt, oi) => (
                    <label key={oi} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name={`q_${q._id}`}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={() => handleAnswer(q._id, opt)}
                      />
                      {opt}
                      {isCreator && q.correctAnswer === opt && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">✓</span>
                      )}
                    </label>
                  ))}
                  {q.type === 'truefalse' && (
                    <>
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          value={true}
                          checked={answers[q._id] === true}
                          onChange={() => handleAnswer(q._id, true)}
                        />
                        True
                        {isCreator && q.correctAnswer === true && <span className="ml-2 text-xs text-emerald-600">✓</span>}
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name={`q_${q._id}`}
                          value={false}
                          checked={answers[q._id] === false}
                          onChange={() => handleAnswer(q._id, false)}
                        />
                        False
                        {isCreator && q.correctAnswer === false && <span className="ml-2 text-xs text-emerald-600">✓</span>}
                      </label>
                    </>
                  )}
                  {(q.type === 'shortanswer' || q.type === 'coding') && (
                    <div>
                      <textarea
                        rows={q.type === 'coding' ? 4 : 2}
                        className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder={q.type === 'coding' ? 'Write your code here...' : 'Type your answer...'}
                        value={answers[q._id] || ''}
                        onChange={(e) => handleAnswer(q._id, e.target.value)}
                      />
                      {isCreator && q.correctAnswer && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Expected: {q.correctAnswer}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </form>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
            <button
              onClick={() => navigate('/quizzes')}
              className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;