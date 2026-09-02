import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Users, Zap } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      username: "rahulsharma",
      avatar: "R",
      color: "from-indigo-500 to-indigo-600",
      rating: 5,
      text: "I taught React and learned Java through SkillSwap. The matching algorithm is incredible! Found a perfect mentor within hours.",
      role: "Web Developer",
      location: "Mumbai, IN",
      swapCount: 24,
    },
    {
      id: 2,
      name: "Priya Patel",
      username: "priyapatel",
      avatar: "P",
      color: "from-emerald-500 to-emerald-600",
      rating: 5,
      text: "I found a UI/UX mentor while helping them learn JavaScript. The platform is intuitive and the community is amazing!",
      role: "UI/UX Designer",
      location: "Bangalore, IN",
      swapCount: 18,
    },
    {
      id: 3,
      name: "Ali Khan",
      username: "alikhan",
      avatar: "A",
      color: "from-rose-500 to-rose-600",
      rating: 5,
      text: "SkillSwap helped me master Python while teaching others Django. Best skill exchange platform ever created!",
      role: "Full Stack Developer",
      location: "Karachi, PK",
      swapCount: 31,
    },
    {
      id: 4,
      name: "Sara Ahmed",
      username: "saraahmed",
      avatar: "S",
      color: "from-purple-500 to-purple-600",
      rating: 4,
      text: "The chat and video features made learning so easy. My mentor was patient and the resources shared were top-notch.",
      role: "Data Analyst",
      location: "Lahore, PK",
      swapCount: 12,
    },
  ];

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-sm border border-indigo-200/50 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>⭐ Success Stories</span>
          </div>
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            What Our Community Says
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Real stories from real people who learned and grew together.
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="relative max-w-4xl mx-auto">
          <div className="p-6 border shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border-slate-200/50 dark:border-slate-700/50 md:p-8 lg:p-10">
            {/* Quote Icon */}
            <div className="absolute text-indigo-200 top-6 right-6 dark:text-indigo-800">
              <Quote className="w-12 h-12 opacity-50" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < current.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-200 dark:text-slate-600"
                  }`}
                />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="mb-6 text-lg leading-relaxed md:text-xl text-slate-700 dark:text-slate-300">
              "{current.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${current.color} flex items-center justify-center text-white font-bold text-lg`}
              >
                {current.avatar}
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">
                  {current.name}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {current.role} • {current.location}
                </p>
                <p className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-3 h-3" />
                  {current.swapCount} successful swaps
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={prevSlide}
              className="p-2 transition-all duration-200 bg-white border rounded-full shadow-md dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 transition-all duration-200 bg-white border rounded-full shadow-md dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-indigo-600"
                    : "w-2 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span>💬</span>
            <span>Join 2,500+ successful learners and mentors</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;