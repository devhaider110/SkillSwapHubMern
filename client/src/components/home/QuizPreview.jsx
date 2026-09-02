import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight, Clock, Award, BarChart3, Zap } from "lucide-react";

const QuizPreview = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "What is JSX?",
      options: [
        "Java Syntax Extension",
        "JavaScript XML",
        "Java XML",
        "JSON Extension",
      ],
      correct: 1,
    },
    {
      question: "What is the correct way to create a React component?",
      options: [
        "function MyComponent() { return <div>Hello</div> }",
        "class MyComponent extends React.Component { render() { return <div>Hello</div> } }",
        "Both A and B",
        "None of the above",
      ],
      correct: 2,
    },
    {
      question: "Which hook is used for side effects in React?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correct: 1,
    },
    {
      question: "What is the virtual DOM in React?",
      options: [
        "A copy of the real DOM",
        "A React component",
        "A JavaScript library",
        "A browser API",
      ],
      correct: 0,
    },
  ];

  const handleOptionClick = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  return (
    <section className="py-12 bg-white md:py-20 dark:bg-slate-900">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>📝 Interactive Quiz</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            Test Your Knowledge Together
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Create quizzes and test each other's skills
          </p>
        </div>

        {/* Quiz Card */}
        <div className="p-6 border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl border-slate-200/50 dark:border-slate-700/50 md:p-8 lg:p-10">
          {!showResult ? (
            <>
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Question {currentQuestion + 1} / {questions.length}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  {Math.floor(Math.random() * 20 + 10)}s remaining
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-8 overflow-hidden">
                <div
                  className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <h3 className="mb-6 text-xl font-bold md:text-2xl text-slate-800 dark:text-white">
                {questions[currentQuestion].question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedOption === index;
                  const isCorrect =
                    selectedOption !== null &&
                    index === questions[currentQuestion].correct;
                  const isWrong =
                    selectedOption !== null &&
                    isSelected &&
                    index !== questions[currentQuestion].correct;

                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionClick(index)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
                        isSelected
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : isWrong
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/30"
                            : "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? isCorrect
                              ? "bg-emerald-500 text-white"
                              : isWrong
                              ? "bg-rose-500 text-white"
                              : "bg-indigo-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {option}
                      </span>
                      {isSelected && isCorrect && (
                        <CheckCircle className="w-5 h-5 ml-auto text-emerald-500" />
                      )}
                      {isSelected && isWrong && (
                        <XCircle className="w-5 h-5 ml-auto text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            // Result
            <div className="py-4 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
                Quiz Complete! 🎉
              </h3>
              <p className="mb-6 text-slate-500 dark:text-slate-400">
                Here's how you performed
              </p>

              {/* Score */}
              <div className="flex items-center justify-center gap-8 mb-8">
                <div>
                  <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                    {score}/{questions.length}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Correct Answers
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-emerald-500">
                    {Math.round((score / questions.length) * 100)}%
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Score
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 mb-8 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full transition-all duration-1000 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500"
                  style={{ width: `${(score / questions.length) * 100}%` }}
                />
              </div>

              {/* Message */}
              <div className="p-4 mb-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl">
                <p className="text-lg font-medium text-indigo-700 dark:text-indigo-300">
                  {score === questions.length
                    ? "🏆 Perfect Score! You're a genius!"
                    : score >= questions.length / 2
                    ? "🎯 Great Job! Keep learning!"
                    : "📚 Keep practicing! You'll get better!"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Retry Quiz
                </button>
                <Link
                  to="/quizzes"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-xl shadow-md transition-all flex items-center gap-1"
                >
                  View All Quizzes
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4">
          <div className="p-4 text-center border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">12</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quizzes Created</p>
          </div>
          <div className="p-4 text-center border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-2xl font-bold text-emerald-500">85%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Avg. Score</p>
          </div>
          <div className="p-4 text-center border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-2xl font-bold text-amber-500">47</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Attempts</p>
          </div>
          <div className="p-4 text-center border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <p className="text-2xl font-bold text-rose-500">3</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Quizzes</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuizPreview;