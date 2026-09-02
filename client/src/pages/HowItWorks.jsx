import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  Handshake,
  MessageCircle,
  Video,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const HowItWorks = () => {

  const steps = [
    {
      number: '01',
      icon: <UserPlus className="w-7 h-7" />,
      title: 'Create Your Profile',
      description:
        'Create your SkillSwap Hub profile and add the skills you can teach and the skills you want to learn.',
    },
    {
      number: '02',
      icon: <Search className="w-7 h-7" />,
      title: 'Discover Skills',
      description:
        'Explore skills, mentors and learners using marketplace, search and smart recommendations.',
    },
    {
      number: '03',
      icon: <Handshake className="w-7 h-7" />,
      title: 'Send a Swap Request',
      description:
        'Find someone with complementary skills and send a skill swap request.',
    },
    {
      number: '04',
      icon: <MessageCircle className="w-7 h-7" />,
      title: 'Connect & Chat',
      description:
        'Once the request is accepted, communicate with your learning partner through chat.',
    },
    {
      number: '05',
      icon: <Video className="w-7 h-7" />,
      title: 'Learn Together',
      description:
        'Schedule learning sessions and meet online to exchange knowledge.',
    },
    {
      number: '06',
      icon: <CheckCircle className="w-7 h-7" />,
      title: 'Complete the Swap',
      description:
        'Complete your learning exchange, leave a review and continue building your skills.',
    },
  ];

  return (
    <div className="min-h-screen px-6 pt-24 pb-16 bg-slate-50 dark:bg-slate-900">

      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">

          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
            How SkillSwap Hub Works
          </h1>

          <p className="max-w-2xl mx-auto mt-4 text-slate-500 dark:text-slate-400">
            Exchange knowledge with people who want to learn what you know
            and teach what you want to learn.
          </p>

        </div>


        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {steps.map((step) => (

            <div
              key={step.number}
              className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700"
            >

              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center justify-center text-indigo-600 bg-indigo-100 w-14 h-14 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-2xl">
                  {step.icon}
                </div>

                <span className="text-3xl font-bold text-slate-200 dark:text-slate-700">
                  {step.number}
                </span>

              </div>

              <h2 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
                {step.title}
              </h2>

              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {step.description}
              </p>

            </div>

          ))}

        </div>


        <div className="text-center mt-14">

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Start Skill Swapping
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>

    </div>
  );
};

export default HowItWorks;