import { UserPlus, Users, MessageCircle, BarChart3, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: <UserPlus className="w-8 h-8" />,
      title: "Create Profile",
      description: "Tell us what you know and what you want to learn.",
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
    },
    {
      id: 2,
      icon: <Users className="w-8 h-8" />,
      title: "Find Your Match",
      description: "Our recommendation system finds compatible learners and mentors.",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    {
      id: 3,
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Connect & Learn",
      description: "Chat, video call and exchange resources together.",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
    },
    {
      id: 4,
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Test & Grow",
      description: "Take quizzes, track progress and complete your skill swap.",
      color: "from-rose-500 to-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      iconBg: "bg-rose-100 dark:bg-rose-900/50",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            🔄 How SkillSwap Works
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Four simple steps to start sharing and learning skills.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop: Horizontal Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2" />

          {/* Steps Grid */}
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative flex flex-col items-center text-center ${step.bg} p-6 md:p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
              >
                {/* Step Number */}
                <div className="absolute flex items-center justify-center w-8 h-8 text-sm font-bold text-white rounded-full shadow-md -top-3 -right-3 bg-slate-800 dark:bg-slate-700">
                  {step.id}
                </div>

                {/* Icon */}
                <div
                  className={`p-4 rounded-2xl ${step.iconBg} text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>

                {/* Arrow (mobile only between steps) */}
                {index < steps.length - 1 && (
                  <div className="mt-4 md:hidden text-slate-300 dark:text-slate-600">
                    <ArrowRight className="w-5 h-5 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Arrows (between steps) */}
          <div className="hidden md:flex absolute top-1/2 left-[calc(12.5%)] right-[calc(12.5%)] -translate-y-1/2 pointer-events-none justify-between">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-center w-6 h-6 -translate-y-1/2 bg-white border rounded-full shadow-md dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
              >
                <ArrowRight className="w-3 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;