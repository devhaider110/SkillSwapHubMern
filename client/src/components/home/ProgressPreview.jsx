import { Link } from "react-router-dom";
import { TrendingUp, Calendar, Award, BookOpen, BarChart3, Zap, ArrowRight } from "lucide-react";

const ProgressPreview = () => {
  const skills = [
    { name: "React", progress: 82, color: "from-cyan-500 to-blue-600" },
    { name: "Java", progress: 65, color: "from-orange-500 to-red-600" },
    { name: "UI/UX", progress: 92, color: "from-purple-500 to-pink-600" },
    { name: "Node.js", progress: 45, color: "from-emerald-500 to-green-600" },
  ];

  const stats = [
    { icon: <TrendingUp className="w-5 h-5 text-orange-500" />, label: "Day Streak", value: "12 🔥" },
    { icon: <BookOpen className="w-5 h-5 text-indigo-500" />, label: "Hours Learned", value: "42" },
    { icon: <Award className="w-5 h-5 text-emerald-500" />, label: "Skills Completed", value: "8" },
    { icon: <BarChart3 className="w-5 h-5 text-rose-500" />, label: "Quizzes Done", value: "23" },
  ];

  return (
    <section className="py-12 md:py-20 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>📈 Track Your Growth</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            See How Much You've Grown
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Visualize your learning journey and stay motivated.
          </p>
        </div>

        {/* Main Progress Card */}
        <div className="p-6 border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl border-slate-200/50 dark:border-slate-700/50 md:p-8 lg:p-10">
          <h3 className="flex items-center gap-2 mb-6 text-lg font-semibold text-slate-800 dark:text-white">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            My Learning Progress
          </h3>

          {/* Skill Progress Bars */}
          <div className="space-y-5">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {skill.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {skill.progress}%
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-1000`}
                    style={{ width: `${skill.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-4 text-center bg-white border dark:bg-slate-900/50 rounded-xl border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center justify-center gap-1">
                  {stat.icon}
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-8 text-center">
            <Link
              to="/dashboard/progress"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-2xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              View Full Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Preview of a mini calendar/upcoming */}
        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-3">
          <div className="flex items-center gap-4 p-5 border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <div className="p-3 bg-blue-100 rounded-xl dark:bg-blue-900/30">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Next Session</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Today, 5:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Next Badge</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">React Master (2% left)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 border bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Goal Progress</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">78% Complete</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressPreview;