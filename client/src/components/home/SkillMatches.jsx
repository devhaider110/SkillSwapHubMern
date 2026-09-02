import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Users, Info, X, MessageCircle, Video, CheckCircle } from "lucide-react";

const SkillMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);

  const matches = [
    {
      id: 1,
      name: "Ali Khan",
      username: "alikhan",
      rating: 4.9,
      avatar: "A",
      color: "from-indigo-500 to-indigo-600",
      teaches: ["Java", "Spring Boot"],
      wants: ["React"],
      match: 98,
      location: "Karachi, PK",
      online: true,
      completedSwaps: 127,
      mutualSkills: ["React", "Java"],
    },
    {
      id: 2,
      name: "Priya Sharma",
      username: "priyasharma",
      rating: 4.8,
      avatar: "P",
      color: "from-emerald-500 to-emerald-600",
      teaches: ["UI/UX", "Figma"],
      wants: ["Python"],
      match: 94,
      location: "Mumbai, IN",
      online: false,
      completedSwaps: 89,
      mutualSkills: ["UI/UX"],
    },
    {
      id: 3,
      name: "Rahul Singh",
      username: "rahulsingh",
      rating: 4.7,
      avatar: "R",
      color: "from-rose-500 to-rose-600",
      teaches: ["Python", "Django"],
      wants: ["JavaScript"],
      match: 91,
      location: "Delhi, IN",
      online: true,
      completedSwaps: 65,
      mutualSkills: ["Python"],
    },
    {
      id: 4,
      name: "Sara Ahmed",
      username: "saraahmed",
      rating: 4.9,
      avatar: "S",
      color: "from-purple-500 to-purple-600",
      teaches: ["Graphic Design", "Illustrator"],
      wants: ["Photography"],
      match: 87,
      location: "Lahore, PK",
      online: false,
      completedSwaps: 154,
      mutualSkills: ["Graphic Design"],
    },
    {
      id: 5,
      name: "Arjun Patel",
      username: "arjunpatel",
      rating: 4.6,
      avatar: "A",
      color: "from-cyan-500 to-cyan-600",
      teaches: ["Data Science", "ML"],
      wants: ["SQL"],
      match: 85,
      location: "Bangalore, IN",
      online: true,
      completedSwaps: 44,
      mutualSkills: ["Data Science"],
    },
  ];

  // Why this match? explanation
  const getMatchExplanation = (match) => {
    const youTeach = match.mutualSkills; // simplified
    const youWant = match.wants;
    const theyTeach = match.teaches;
    const theyWant = match.wants;
    return {
      reasons: [
        `✓ You want to learn ${match.teaches[0]}`,
        `✓ ${match.name} teaches ${match.teaches.join(", ")}`,
        `✓ ${match.name} wants to learn ${match.wants.join(", ")}`,
        `✓ You teach ${match.mutualSkills.join(", ")}`,
        `✓ Same availability and location`,
        `✓ ${match.completedSwaps} successful swaps`,
      ],
      summary: "Perfect mutual skill swap!",
    };
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
            🎯 Perfect Matches For You
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            People who want what you teach, and teach what you want to learn.
          </p>
        </div>

        {/* Cards - Scrollable horizontal carousel */}
        <div className="relative pb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
          <div className="flex gap-6 snap-x snap-mandatory">
            {matches.map((match) => (
              <div
                key={match.id}
                className="min-w-[280px] md:min-w-[320px] max-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 snap-start flex-shrink-0 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300/50 dark:hover:border-indigo-600/50"
              >
                {/* Top: Avatar + Rating + Online status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${match.color} flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {match.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">
                        {match.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{match.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{match.location}</span>
                      </div>
                    </div>
                  </div>
                  {/* Online dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      match.online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                </div>

                {/* Skills */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Teaches</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {match.teaches.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">Wants to Learn</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {match.wants.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Match Percentage */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {match.match}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Match</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3 h-3" />
                    {match.completedSwaps} swaps
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500"
                    style={{ width: `${match.match}%` }}
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-2 mt-5">
                  <Link
                    to={`/profile/${match.username}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-center text-indigo-600 transition-colors border border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    View Profile
                  </Link>
                  <button className="flex items-center justify-center flex-1 gap-1 px-3 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 shadow-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                  </button>
                </div>

                {/* Extra actions */}
                <div className="flex items-center justify-between mt-3">
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Video className="w-3.5 h-3.5" />
                    Video Call
                  </button>
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Send Request
                  </button>
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Why this match?
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "Why this match?" Modal */}
        {selectedMatch && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedMatch(null)}
          >
            <div
              className="w-full max-w-md p-6 mx-4 bg-white shadow-2xl dark:bg-slate-800 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  Why {selectedMatch.name}?
                </h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-1 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {getMatchExplanation(selectedMatch).reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span>{reason}</span>
                  </div>
                ))}
                <div className="p-3 mt-4 font-semibold text-center text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl dark:text-indigo-300">
                  {getMatchExplanation(selectedMatch).summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillMatches;