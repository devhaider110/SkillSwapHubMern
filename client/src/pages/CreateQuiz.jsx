import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createQuiz, getIncomingRequests } from '../services/api';
import { Plus, Trash2, Save } from 'lucide-react';

const CreateQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [passingScore, setPassingScore] = useState(50);
  const [swapRequestId, setSwapRequestId] = useState('');
  const [swaps, setSwaps] = useState([]);
  const [questions, setQuestions] = useState([
    { type: 'mcq', text: '', options: ['', ''], correctAnswer: 0 },
  ]);

  // Fetch eligible swaps (accepted or completed where user is the receiver)
  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const res = await getIncomingRequests();
        const eligible = res.data.requests.filter(
          (r) => r.status === 'accepted' || r.status === 'completed'
        );
        setSwaps(eligible);
      } catch (err) {
        console.error('Failed to fetch swaps:', err);
      }
    };
    fetchSwaps();
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'mcq', text: '', options: ['', ''], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) return;
    updated[qIndex].options.splice(optIndex, 1);
    if (updated[qIndex].correctAnswer >= updated[qIndex].options.length) {
      updated[qIndex].correctAnswer = updated[qIndex].options.length - 1;
    }
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        timeLimit,
        passingScore,
        swapRequestId: swapRequestId || null,
        questions: questions.map((q) => ({
          ...q,
          correctAnswer: q.type === 'mcq' ? q.options[q.correctAnswer] : q.correctAnswer,
        })),
      };
      await createQuiz(payload);
      navigate('/quizzes');
    } catch (err) {
      console.error('Create quiz error:', err);
      alert(err.response?.data?.message || 'Failed to create quiz.');
    }
  };

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-slate-800 dark:text-white">Create a Quiz</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Time Limit (minutes)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={1}
                  className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            {/* ✅ NEW: Swap Dropdown */}
            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Link to Swap (optional)</label>
              <select
                value={swapRequestId}
                onChange={(e) => setSwapRequestId(e.target.value)}
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">None</option>
                {swaps.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.learnSkillId?.skillName || 'Swap'} with {s.requesterId?.name}
                    {s.status === 'completed' ? ' ✅' : ''}
                  </option>
                ))}
              </select>
              {swaps.length === 0 && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  No accepted or completed swaps found. Create a quiz without linking.
                </p>
              )}
            </div>

            <div className="mt-4">
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Passing Score (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Questions section – same as before */}
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Question {qIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 transition rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                    disabled={questions.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Question text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                    className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="truefalse">True / False</option>
                    <option value="shortanswer">Short Answer</option>
                    <option value="coding">Coding</option>
                  </select>

                  {q.type === 'mcq' && (
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Option ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                            className="flex-1 px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, optIndex)}
                            className="p-1 transition rounded-lg text-rose-400 hover:bg-rose-50 disabled:opacity-50"
                            disabled={q.options.length <= 2}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <label className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <input
                              type="radio"
                              name={`correct_${qIndex}`}
                              checked={q.correctAnswer === optIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                            />
                            Correct
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add option
                      </button>
                    </div>
                  )}

                  {q.type === 'truefalse' && (
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name={`tf_${qIndex}`}
                          checked={q.correctAnswer === true}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', true)}
                        />
                        True
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name={`tf_${qIndex}`}
                          checked={q.correctAnswer === false}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', false)}
                        />
                        False
                      </label>
                    </div>
                  )}

                  {(q.type === 'shortanswer' || q.type === 'coding') && (
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Correct Answer</label>
                      <input
                        type="text"
                        value={q.correctAnswer || ''}
                        onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                        placeholder={q.type === 'coding' ? 'Expected output or keyword' : 'Expected answer'}
                        className="w-full px-4 py-2 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 text-indigo-600 transition border border-indigo-200 rounded-xl dark:text-indigo-400 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 text-white transition bg-indigo-600 shadow rounded-xl hover:bg-indigo-700"
            >
              <Save className="w-4 h-4" /> Save Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;