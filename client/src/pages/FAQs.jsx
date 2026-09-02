import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is SkillSwap Hub?', a: 'SkillSwap Hub is a peer-to-peer skill exchange platform where you can teach your skills and learn new ones from others.' },
    { q: 'How do I request a swap?', a: 'Go to Marketplace, browse skills, click "Request Swap", select your skills, and submit.' },
    { q: 'Is the platform free?', a: 'Yes! SkillSwap Hub is completely free to use. No hidden charges.' },
    { q: 'How do I become a mentor?', a: 'Add your teaching skills to your profile and accept swap requests from learners.' },
    { q: 'How do I delete my account?', a: 'Go to Settings → Account → Delete Account. Confirm with password.' },
    { q: 'What happens if a swap goes wrong?', a: 'You can contact support. We encourage respectful communication between users.' },
    { q: 'Can I review my mentor/learner?', a: 'Yes, after a swap is completed, you can leave a review with ratings.' },
    { q: 'How are matches recommended?', a: 'Our algorithm matches users based on mutual skills, rating, and availability.' },
  ];

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">FAQs</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Frequently asked questions about SkillSwap Hub.</p>

        <div className="mt-6 space-y-3">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="overflow-hidden bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="flex items-center justify-between w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-700/30"
              >
                <span className="font-medium text-slate-800 dark:text-white">{item.q}</span>
                {openIndex === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
              {openIndex === idx && (
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FAQs;