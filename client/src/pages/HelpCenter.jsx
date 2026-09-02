import { Search, AlertCircle, Key, User, BookOpen, RefreshCw, MessageSquare, Video, Settings, Trash2 } from 'lucide-react';

const HelpCenter = () => {
  const topics = [
    { icon: <Key className="w-5 h-5" />, title: 'Login & Password', desc: 'Reset password, email verification, 2FA' },
    { icon: <User className="w-5 h-5" />, title: 'Profile Management', desc: 'Update bio, profile picture, public/private settings' },
    { icon: <BookOpen className="w-5 h-5" />, title: 'Skills', desc: 'Add, edit, delete teach/learn skills' },
    { icon: <RefreshCw className="w-5 h-5" />, title: 'Swap Requests', desc: 'Send, accept, reject, complete swaps' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Chat', desc: 'Real-time messaging, typing indicators, read receipts' },
    { icon: <Video className="w-5 h-5" />, title: 'Sessions', desc: 'Schedule, join, manage video learning sessions' },
    { icon: <Settings className="w-5 h-5" />, title: 'Settings', desc: 'Privacy, notifications, theme, delete account' },
    { icon: <Trash2 className="w-5 h-5" />, title: 'Account', desc: 'Deactivate or permanently delete your account' },
  ];

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Help Center</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Find answers to common problems and get support.</p>

        <div className="relative mt-6">
          <Search className="absolute w-5 h-5 text-slate-400 left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search help topics..."
            className="w-full py-3 pl-12 pr-4 bg-white border rounded-xl dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2">
          {topics.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 transition bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
            >
              <div className="p-2 text-indigo-600 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400">
                {item.icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HelpCenter;