import { Link } from "react-router-dom";
import { Star, Users, Award, Briefcase, MapPin, MessageCircle, Zap } from "lucide-react";

const TopMentors = () => {
  const mentors = [
    {
      id: 1,
      name: "Rahul Sharma",
      username: "rahulsharma",
      avatar: "R",
      color: "from-indigo-500 to-indigo-600",
      rating: 4.9,
      title: "MERN Developer",
      skills: ["React", "Node", "MongoDB"],
      swaps: 127,
      location: "Mumbai, IN",
      online: true,
      verified: true,
    },
    {
      id: 2,
      name: "Priya Patel",
      username: "priyapatel",
      avatar: "P",
      color: "from-emerald-500 to-emerald-600",
      rating: 4.8,
      title: "UI/UX Designer",
      skills: ["Figma", "Adobe XD", "Sketch"],
      swaps: 89,
      location: "Bangalore, IN",
      online: false,
      verified: true,
    },
    {
      id: 3,
      name: "Ali Khan",
      username: "alikhan",
      avatar: "A",
      color: "from-rose-500 to-rose-600",
      rating: 4.9,
      title: "Java & Spring Expert",
      skills: ["Java", "Spring Boot", "Microservices"],
      swaps: 154,
      location: "Karachi, PK",
      online: true,
      verified: true,
    },
    {
      id: 4,
      name: "Sara Ahmed",
      username: "saraahmed",
      avatar: "S",
      color: "from-purple-500 to-purple-600",
      rating: 4.7,
      title: "Data Scientist",
      skills: ["Python", "ML", "SQL"],
      swaps: 65,
      location: "Lahore, PK",
      online: false,
      verified: false,
    },
  ];

  return (
    <section className="py-12 bg-white md:py-20 dark:bg-slate-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 mb-10 sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl text-slate-800 dark:text-white">
              👨‍🏫 Learn From Top Skill Sharers
            </h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Best rated mentors on SkillSwap Hub
            </p>
          </div>
          <Link
            to="/people"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 rounded-xl transition-all duration-200"
          >
            View All Mentors
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className="relative p-6 transition-all bg-white border shadow-lg dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300/50 dark:hover:border-indigo-600/50"
            >
              {/* Verified Badge */}
              {mentor.verified && (
                <div className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-md">
                  <Award className="w-3 h-3" />
                  Verified
                </div>
              )}

              {/* Online Status Dot */}
              <div className="absolute top-4 right-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    mentor.online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${mentor.color} flex items-center justify-center text-white font-bold text-xl`}
                >
                  {mentor.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {mentor.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{mentor.rating}</span>
                    <span className="mx-1">•</span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" /> {mentor.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                {mentor.title}
              </p>

              {/* Skills */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mentor.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {mentor.swaps} Swaps
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Top Mentor
                </span>
              </div>

              {/* Button */}
              <Link
                to={`/profile/${mentor.username}`}
                className="mt-4 w-full block text-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopMentors;