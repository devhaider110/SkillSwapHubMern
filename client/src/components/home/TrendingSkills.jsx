import { Link } from "react-router-dom";
import { Users, ArrowRight, Code, Coffee, Palette, Database, BarChart, Camera, MessageCircle, Brain, Briefcase, Layers, Zap, Rocket } from "lucide-react";

const TrendingSkills = () => {
  const skills = [
    {
      id: 1,
      name: "Web Development",
      icon: <Code className="w-6 h-6" />,
      category: "Programming",
      students: 1240,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
    },
    {
      id: 2,
      name: "Java",
      icon: <Coffee className="w-6 h-6" />,
      category: "Programming",
      students: 980,
      color: "from-orange-500 to-red-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
    },
    {
      id: 3,
      name: "React",
      icon: <Zap className="w-6 h-6" />,
      category: "Frontend",
      students: 870,
      color: "from-cyan-500 to-blue-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
    },
    {
      id: 4,
      name: "Python",
      icon: <Database className="w-6 h-6" />,
      category: "Programming",
      students: 1500,
      color: "from-green-500 to-emerald-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      iconBg: "bg-green-100 dark:bg-green-900/50",
    },
    {
      id: 5,
      name: "UI/UX Design",
      icon: <Palette className="w-6 h-6" />,
      category: "Design",
      students: 760,
      color: "from-purple-500 to-pink-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      id: 6,
      name: "Data Science",
      icon: <BarChart className="w-6 h-6" />,
      category: "Analytics",
      students: 1200,
      color: "from-teal-500 to-green-600",
      bg: "bg-teal-50 dark:bg-teal-950/30",
      iconBg: "bg-teal-100 dark:bg-teal-900/50",
    },
    {
      id: 7,
      name: "Photography",
      icon: <Camera className="w-6 h-6" />,
      category: "Creative",
      students: 540,
      color: "from-yellow-500 to-amber-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/50",
    },
    {
      id: 8,
      name: "Machine Learning",
      icon: <Brain className="w-6 h-6" />,
      category: "AI",
      students: 1100,
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      iconBg: "bg-rose-100 dark:bg-rose-900/50",
    },
  ];

  return (
    <section className="relative py-12 overflow-hidden md:py-20">
      {/* Background decorative element */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 mb-10 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
              🔥 Explore Popular Skills
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Most in-demand skills on SkillSwap Hub
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 rounded-xl transition-all duration-200"
          >
            View All Skills
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              to={`/explore?skill=${encodeURIComponent(skill.name)}`}
              className={`group relative ${skill.bg} border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-indigo-300/50 dark:hover:border-indigo-600/50 hover:-translate-y-1`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-emerald-500/0 group-hover:opacity-100"></div>

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl ${skill.iconBg} text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300`}>
                {skill.icon}
              </div>

              {/* Name */}
              <h3 className="mt-3 text-sm font-semibold text-slate-800 dark:text-white md:text-base">
                {skill.name}
              </h3>

              {/* Category */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {skill.category}
              </p>

              {/* Students count */}
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <Users className="w-3 h-3" />
                <span>{skill.students.toLocaleString()} learners</span>
              </div>

              {/* Hover arrow indicator */}
              <div className="absolute transition-opacity duration-300 opacity-0 bottom-4 right-4 group-hover:opacity-100">
                <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSkills;