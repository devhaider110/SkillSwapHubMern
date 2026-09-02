import { Link } from "react-router-dom";
import { ArrowRight, Star, Zap, Users, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative pt-12 overflow-hidden md:pt-16 lg:pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-1/2 w-[800px] h-[800px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-1/2 w-[800px] h-[800px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">

          {/* -------- LEFT CONTENT -------- */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-indigo-700 border rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-700/50 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span>✨ 10,000+ Skills Exchanged</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-800 dark:text-white leading-[1.1]">
              Share What You Know.
              <br />
              <span className="text-transparent bg-gradient-to-r from-indigo-600 to-emerald-500 bg-clip-text">
                Learn What You Love.
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed sm:text-xl text-slate-600 dark:text-slate-300 lg:mx-0">
              Connect with people who have the skills you want and need the skills you already have.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row lg:justify-start">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-indigo-600 shadow-lg hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl hover:shadow-xl hover:scale-105"
              >
                Find Your Skill Match
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold transition-all duration-300 border shadow-md text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl hover:shadow-lg hover:scale-105"
              >
                Explore Skills
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12 lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">2,500+</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Swaps</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/30">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">4.9⭐</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                  <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">98%</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Match Accuracy</p>
                </div>
              </div>
            </div>
          </div>

          {/* -------- RIGHT VISUAL -------- */}
          <div className="relative flex justify-center flex-1 lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-square">
              {/* Main Card - Match Visual */}
              <div className="flex flex-col items-center justify-center w-full h-full p-6 border rounded-3xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 dark:from-indigo-500/5 dark:to-emerald-500/5 border-slate-200/30 dark:border-slate-700/30 backdrop-blur-sm">
                
                {/* Top - You */}
                <div className="flex items-center gap-4 px-6 py-4 border shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
                    Y
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800 dark:text-white">You</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">⚛️ React</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">🟢 Node</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="my-4 text-slate-400 dark:text-slate-500">
                  <ArrowRight className="w-8 h-8 rotate-90" />
                </div>

                {/* Center - Match Badge */}
                <div className="px-6 py-3 shadow-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500">
                  <span className="flex items-center gap-2 text-lg font-bold text-white">
                    <Zap className="w-5 h-5 fill-white" />
                    Perfect Match — 98%
                  </span>
                </div>

                {/* Arrow Down */}
                <div className="my-4 text-slate-400 dark:text-slate-500">
                  <ArrowRight className="w-8 h-8 rotate-90" />
                </div>

                {/* Bottom - Sarah */}
                <div className="flex items-center gap-4 px-6 py-4 border shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-white rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                    S
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 dark:text-white">Sarah</p>
                      <span className="text-xs text-yellow-500">⭐ 4.9</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">☕ Java</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">🌱 Spring</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute px-4 py-3 border shadow-xl -top-4 -right-4 lg:-top-8 lg:-right-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-slate-200/50 dark:border-slate-700/50 animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full dark:bg-yellow-900/50">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">4.9 Rating</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Top Mentor</p>
                  </div>
                </div>
              </div>

              <div className="absolute px-4 py-3 border shadow-xl -bottom-4 -left-4 lg:-bottom-8 lg:-left-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border-slate-200/50 dark:border-slate-700/50 animate-bounce-slow animation-delay-200">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full dark:bg-green-900/50">
                    <Users className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">🔥 127 Swaps</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;