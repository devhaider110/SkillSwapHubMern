import { Link } from "react-router-dom";
import { FileText, MessageCircle, Video, ClipboardCheck, ArrowRight, Users, Zap } from "lucide-react";

const LearnTogether = () => {
  const features = [
    {
      id: 1,
      icon: <FileText className="w-8 h-8" />,
      title: "Share Resources",
      description: "Share PDF, PPT, DOC, images, notes and useful links with your learning partner.",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      link: "/resources",
    },
    {
      id: 2,
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Chat Together",
      description: "Discuss concepts through real-time messaging with typing indicators and read receipts.",
      color: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      link: "/chat",
    },
    {
      id: 3,
      icon: <Video className="w-8 h-8" />,
      title: "Learn Face-to-Face",
      description: "Join scheduled video learning sessions with screen sharing and whiteboard.",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      iconBg: "bg-purple-100 dark:bg-purple-900/50",
      link: "/meetings",
    },
    {
      id: 4,
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Take Tests Together",
      description: "Create quizzes and test each other's knowledge with instant results and analytics.",
      color: "from-rose-500 to-rose-600",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      iconBg: "bg-rose-100 dark:bg-rose-900/50",
      link: "/quizzes",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>📚 Learning Is Better Together</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            Everything You Need to <span className="text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text">Learn Together</span>
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            From resources to video calls — all in one platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.link}
              className={`group ${feature.bg} border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-indigo-300/50 dark:hover:border-indigo-600/50 flex items-start gap-5`}
            >
              <div
                className={`p-3 rounded-2xl ${feature.iconBg} text-slate-700 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300`}
              >
                {feature.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
                <div className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-indigo-600 transition-all duration-300 dark:text-indigo-400 group-hover:gap-2">
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Join SkillSwap Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LearnTogether;