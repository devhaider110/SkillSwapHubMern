import { Link } from "react-router-dom";
import { ArrowRight, Users, Star, Zap, Sparkles, CheckCircle, Code, Coffee, Palette } from "lucide-react";

const SmartMatching = () => {
  return (
    <section className="relative py-16 overflow-hidden md:py-24">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>🧠 AI-Powered Recommendations</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            Stop Searching. Let SkillSwap Find Your Match.
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Our smart algorithm connects you with the perfect learning partners.
          </p>
        </div>

        {/* Main Content */}
        <div className="p-6 border shadow-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl border-slate-200/50 dark:border-slate-700/50 md:p-10 lg:p-12">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            
            {/* Left: YOU */}
            <div className="flex-1 w-full">
              <div className="p-6 bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600">
                    Y
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">You</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your Skills</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">I Know:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" /> React
                      </span>
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" /> Node.js
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">I Want:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" /> Java
                      </span>
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" /> Spring Boot
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Arrow + Match Badge */}
            <div className="flex flex-col items-center gap-3">
              <ArrowRight className="w-10 h-10 rotate-90 text-slate-300 dark:text-slate-600 lg:rotate-0" />
              <div className="px-6 py-3 shadow-xl rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 animate-pulse-slow">
                <span className="flex items-center gap-2 text-lg font-bold text-white">
                  <Zap className="w-5 h-5 fill-white" />
                  🧠 Smart Matching
                </span>
              </div>
              <ArrowRight className="w-10 h-10 rotate-90 text-slate-300 dark:text-slate-600 lg:rotate-0" />
            </div>

            {/* Right: Best Match */}
            <div className="flex-1 w-full">
              <div className="relative p-6 bg-white border-2 shadow-lg dark:bg-slate-800 rounded-2xl border-indigo-300/50 dark:border-indigo-600/50">
                {/* "Best Match" badge */}
                <div className="absolute px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500">
                  🏆 Best Match
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                    A
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-white">Ali</h3>
                      <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-yellow-400" /> 4.9
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Top Mentor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Knows:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" /> Java
                      </span>
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5" /> Spring Boot
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Wants:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="px-3 py-1.5 text-sm rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" /> React
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">98%</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Perfect Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-8 text-center">
            <Link
              to="/dashboard/matches"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-2xl hover:shadow-xl hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              Find My Match
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartMatching;