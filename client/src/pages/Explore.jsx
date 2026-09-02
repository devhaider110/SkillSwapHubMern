import { Link } from 'react-router-dom';

import {
  Compass,
  TrendingUp,
  Star,
  Users,
  Code,
  Palette,
  Database,
  Camera,
  ArrowRight,
} from 'lucide-react';

const Explore = () => {

  const categories = [
    {
      name: 'Web Development',
      icon: <Code className="w-6 h-6" />,
      color: 'bg-blue-500',
    },
    {
      name: 'UI/UX Design',
      icon: <Palette className="w-6 h-6" />,
      color: 'bg-purple-500',
    },
    {
      name: 'Data Science',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-emerald-500',
    },
    {
      name: 'Photography',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-amber-500',
    },
  ];

  const trendingSkills = [
    'React',
    'Java',
    'Python',
    'UI/UX',
    'Machine Learning',
    'Node.js',
    'Graphic Design',
    'Communication',
    'DSA',
    'Spring Boot',
  ];

  const topMentors = [
    {
      name: 'Rahul Sharma',
      skill: 'React & Node',
      rating: 4.9,
      swaps: 127,
    },
    {
      name: 'Priya Patel',
      skill: 'UI/UX Design',
      rating: 4.8,
      swaps: 89,
    },
    {
      name: 'Ali Khan',
      skill: 'Java & Spring',
      rating: 4.9,
      swaps: 154,
    },
  ];

  return (
    <div className="min-h-screen px-6 pt-24 pb-12 bg-slate-50 dark:bg-slate-900">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-12 text-center">

          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
            Explore Skills
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Discover new skills, trending topics, and top mentors.
          </p>

        </div>


        {/* CATEGORIES */}

        <section className="mb-12">

          <h2 className="flex items-center gap-2 mb-5 text-2xl font-bold text-slate-800 dark:text-white">
            <Compass className="w-6 h-6 text-indigo-500" />
            Browse by Category
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {categories.map((category) => (

              <Link
                key={category.name}
                to={`/marketplace?category=${encodeURIComponent(
                  category.name
                )}`}
                className={`
                  ${category.color}
                  flex flex-col items-center justify-center
                  gap-3 p-6
                  text-white
                  rounded-2xl
                  shadow-md
                  transition
                  hover:shadow-xl
                  hover:-translate-y-1
                `}
              >

                {category.icon}

                <span className="font-semibold text-center">
                  {category.name}
                </span>

              </Link>

            ))}

          </div>

        </section>


        {/* TRENDING SKILLS */}

        <section className="mb-12">

          <h2 className="flex items-center gap-2 mb-5 text-2xl font-bold text-slate-800 dark:text-white">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            Trending Skills
          </h2>

          <div className="flex flex-wrap gap-3">

            {trendingSkills.map((skill) => (

              <Link
                key={skill}
                to={`/search?q=${encodeURIComponent(skill)}`}
                className="px-4 py-2 text-sm font-medium transition bg-white border rounded-full dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                {skill}
              </Link>

            ))}

          </div>

        </section>


        {/* TOP MENTORS */}

        <section>

          <h2 className="flex items-center gap-2 mb-5 text-2xl font-bold text-slate-800 dark:text-white">
            <Users className="w-6 h-6 text-emerald-500" />
            Top Mentors
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {topMentors.map((mentor) => (

              <div
                key={mentor.name}
                className="p-5 transition bg-white border shadow-md dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700 hover:shadow-lg"
              >

                <div className="flex items-center gap-3">

                  <div className="flex items-center justify-center w-12 h-12 text-xl font-bold text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
                    {mentor.name.charAt(0)}
                  </div>

                  <div>

                    <p className="font-bold text-slate-800 dark:text-white">
                      {mentor.name}
                    </p>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {mentor.skill}
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">

                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {mentor.rating}
                  </span>

                  <span>•</span>

                  <span>
                    {mentor.swaps} swaps
                  </span>

                </div>


                <Link
                  to={`/search?q=${encodeURIComponent(mentor.name)}`}
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>

              </div>

            ))}

          </div>

        </section>


        {/* MARKETPLACE CTA */}

        <div className="mt-12 text-center">

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white transition bg-indigo-600 shadow-md rounded-xl hover:bg-indigo-700"
          >
            Go to Full Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Explore;