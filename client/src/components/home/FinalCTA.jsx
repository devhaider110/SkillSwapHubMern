import { Link } from "react-router-dom";
import { Rocket, Users, Star, Shield, Sparkles, ArrowRight, CheckCircle } from "lucide-react";

const FinalCTA = () => {
  const features = [
    { icon: <Users className="w-5 h-5" />, text: "Connect with mentors" },
    { icon: <Star className="w-5 h-5" />, text: "Find your perfect match" },
    { icon: <Shield className="w-5 h-5" />, text: "Safe & verified" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Learn at your pace" },
  ];

  return (
    <section className="relative py-16 overflow-hidden md:py-24">
      {/* Background - Light mode friendly */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-indigo-50 to-emerald-100 dark:from-indigo-900 dark:via-indigo-800 dark:to-emerald-900"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 -left-1/2 w-[600px] h-[600px] bg-indigo-200/30 dark:bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -right-1/2 w-[600px] h-[600px] bg-emerald-200/30 dark:bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 dark:bg-white/20 backdrop-blur-sm border border-indigo-200/50 dark:border-white/30 text-indigo-700 dark:text-white text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            <span>🚀 Join the Learning Revolution</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-800 dark:text-white leading-[1.1]">
            You Already Have Something
            <br />
            <span className="text-indigo-600 dark:text-yellow-300">Worth Teaching.</span>
          </h2>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto mt-6 text-lg leading-relaxed md:text-xl text-slate-700 dark:text-white/90">
            Share your knowledge, discover new skills, and grow together with a
            community of passionate learners.
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 md:gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 text-sm border rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-sm border-slate-200/50 dark:border-white/20 text-slate-700 dark:text-white"
              >
                {feature.icon}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-indigo-600 shadow-xl hover:bg-indigo-700 dark:bg-white dark:text-indigo-700 dark:hover:bg-gray-50 rounded-2xl hover:shadow-2xl hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-indigo-700 transition-all duration-300 border-2 border-indigo-200 dark:text-white bg-white/70 dark:bg-white/10 backdrop-blur-sm dark:border-white/30 hover:bg-indigo-50 dark:hover:bg-white/20 rounded-2xl hover:shadow-xl hover:scale-105"
            >
              Find Your Match
              <Users className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 md:gap-8 text-slate-600 dark:text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              <span className="text-sm">100% free to join</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 mt-10 border-t border-slate-200/50 dark:border-white/20">
            <div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">2,500+</p>
              <p className="text-sm text-slate-600 dark:text-white/70">Active Swaps</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">4.9⭐</p>
              <p className="text-sm text-slate-600 dark:text-white/70">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800 dark:text-white">98%</p>
              <p className="text-sm text-slate-600 dark:text-white/70">Match Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;