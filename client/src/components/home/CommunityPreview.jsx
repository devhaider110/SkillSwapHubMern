import { Link } from "react-router-dom";
import { Users, Award, Flame, MessageCircle, Heart, Share2, TrendingUp, Zap, ArrowRight, Sparkles, Crown, Star, Medal } from "lucide-react";

const CommunityPreview = () => {
  const badges = [
    { name: "Top Mentor", icon: <Crown className="w-5 h-5" />, color: "from-yellow-400 to-orange-500" },
    { name: "30 Day Streak", icon: <Flame className="w-5 h-5" />, color: "from-orange-500 to-red-500" },
    { name: "5 Star Mentor", icon: <Star className="w-5 h-5" />, color: "from-yellow-500 to-yellow-600" },
    { name: "Java Master", icon: <Award className="w-5 h-5" />, color: "from-indigo-500 to-purple-600" },
    { name: "50 Swaps", icon: <Medal className="w-5 h-5" />, color: "from-emerald-500 to-teal-600" },
    { name: "Super Learner", icon: <Sparkles className="w-5 h-5" />, color: "from-purple-500 to-pink-600" },
    { name: "Community Helper", icon: <Users className="w-5 h-5" />, color: "from-blue-500 to-cyan-600" },
    { name: "Quiz Champion", icon: <TrendingUp className="w-5 h-5" />, color: "from-rose-500 to-pink-600" },
  ];

  const posts = [
    {
      id: 1,
      author: "Rahul Sharma",
      avatar: "R",
      color: "from-indigo-500 to-indigo-600",
      title: "What's the best way to learn React in 2026?",
      content: "I've been learning React for a month now. Any tips on mastering hooks and state management?",
      likes: 24,
      comments: 12,
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "Priya Patel",
      avatar: "P",
      color: "from-emerald-500 to-emerald-600",
      title: "Looking for a UI/UX mentor",
      content: "I'm a beginner designer looking for someone to review my portfolio. Happy to teach JavaScript in exchange!",
      likes: 18,
      comments: 8,
      time: "5 hours ago",
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>🏆 Community & Achievements</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            Level Up & Connect With Others
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Earn badges, join discussions, and grow together.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="mb-12">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-slate-800 dark:text-white">
            <Award className="w-5 h-5 text-yellow-500" />
            Your Achievements
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="p-4 text-center transition-all duration-300 border bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:scale-105"
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-white shadow-md`}
                >
                  {badge.icon}
                </div>
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Discussion Forum Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
              <MessageCircle className="w-5 h-5 text-indigo-500" />
              Latest Discussions
            </h3>
            <Link
              to="/community"
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-5 transition-all duration-300 border bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-indigo-300/50 dark:hover:border-indigo-600/50"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        {post.author}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{post.time}</span>
                      <span className="flex items-center gap-1 ml-auto text-xs text-slate-400 dark:text-slate-500">
                        <Users className="w-3 h-3" />
                        <span className="hidden sm:inline">Community</span>
                      </span>
                    </div>
                    <h4 className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {post.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-rose-500">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-indigo-500">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1 text-xs transition-colors text-slate-400 hover:text-emerald-500">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Join Community CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-2xl hover:shadow-xl hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Join the Community
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommunityPreview;