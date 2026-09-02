import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
  const posts = [
    { title: 'Top 10 Skills to Learn in 2026', category: 'Career', date: 'Aug 20, 2026', author: 'Admin', excerpt: 'AI, Data Science, Web Dev, UI/UX, Cloud...' },
    { title: 'Crack DSA Interviews – Complete Guide', category: 'DSA', date: 'Aug 15, 2026', author: 'Admin', excerpt: 'Arrays, Linked Lists, Trees, Graphs, DP...' },
    { title: 'React vs Vue – Which One to Learn First?', category: 'Web Dev', date: 'Aug 10, 2026', author: 'Admin', excerpt: 'Pros, cons, learning curve, job market...' },
    { title: 'How to Prepare for FAANG Interviews', category: 'Career', date: 'Aug 5, 2026', author: 'Admin', excerpt: 'Resume, projects, mock interviews, tips...' },
    { title: 'Machine Learning for Beginners', category: 'AI/ML', date: 'Jul 28, 2026', author: 'Admin', excerpt: 'Python, NumPy, Pandas, Scikit-learn...' },
    { title: '5 Learning Hacks to Master Any Skill', category: 'Learning Tips', date: 'Jul 20, 2026', author: 'Admin', excerpt: 'Spaced repetition, active recall, Pomodoro...' },
  ];

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Blog</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Insights, tips, and stories from the SkillSwap community.</p>

        <div className="mt-6 space-y-6">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="p-5 transition bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50 hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">{post.category}</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-slate-800 dark:text-white">{post.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{post.excerpt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Blog;