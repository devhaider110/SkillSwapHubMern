import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Target,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const About = () => {

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Learn Together',
      description:
        'Find people who can teach the skills you want to learn.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Smart Matching',
      description:
        'Discover users based on complementary teaching and learning skills.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Trusted Platform',
      description:
        'Profiles, requests, reviews and secure authentication help create a better learning environment.',
    },
  ];

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 bg-slate-50 dark:bg-slate-900">

      <div className="max-w-5xl mx-auto">

        {/* HERO */}

        <div className="text-center">

          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 text-indigo-600 bg-indigo-100 rounded-2xl dark:bg-indigo-900/30 dark:text-indigo-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
            About SkillSwap Hub
          </h1>

          <p className="max-w-3xl mx-auto mt-5 text-lg leading-8 text-slate-500 dark:text-slate-400">
            SkillSwap Hub is a knowledge-sharing platform designed to
            connect people who want to teach and learn skills from each
            other.
          </p>

        </div>


        {/* MISSION */}

        <div className="p-8 mt-12 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">

          <h2 className="mb-4 text-2xl font-bold text-slate-800 dark:text-white">
            Our Mission
          </h2>

          <p className="leading-8 text-slate-600 dark:text-slate-300">
            Our goal is to make skill exchange simple, accessible and
            community-driven. Instead of only consuming courses, users can
            actively exchange their knowledge with other learners.
          </p>

        </div>


        {/* FEATURES */}

        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="p-6 bg-white border dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700"
            >

              <div className="flex items-center justify-center w-12 h-12 mb-4 text-indigo-600 bg-indigo-100 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
                {feature.icon}
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-white">
                {feature.title}
              </h3>

              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>

            </div>

          ))}

        </div>


        {/* CTA */}

        <div className="mt-10 text-center">

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Explore SkillSwap Hub
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>

    </div>
  );
};

export default About;