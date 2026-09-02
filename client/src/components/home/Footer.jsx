import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t dark:bg-slate-900 border-slate-200/50 dark:border-slate-700/50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 md:gap-10">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center shadow-md w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                SkillSwap
                <span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="max-w-sm mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Learn • Teach • Share • Test • Grow Together
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Connect with people who have the skills you want and need the skills you already have.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="#" className="transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">GitHub</a>
              <a href="#" className="transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">LinkedIn</a>
              <a href="#" className="transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Instagram</a>
              <a href="#" className="transition-colors text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Twitter</a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-3 font-semibold text-slate-800 dark:text-white">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Explore Skills</Link></li>
              <li><Link to="/marketplace" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Find Mentors</Link></li>
              <li><Link to="/marketplace" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Find Learners</Link></li>
              <li><Link to="/matches" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Skill Matches</Link></li>
              <li><Link to="/community" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Community</Link></li>
            </ul>
          </div>

          {/* Resources Links – All using Link */}
          <div>
            <h4 className="mb-3 font-semibold text-slate-800 dark:text-white">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</Link></li>
              <li><Link to="/help" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Help Center</Link></li>
              <li><Link to="/blog" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Blog</Link></li>
              <li><Link to="/faqs" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">FAQs</Link></li>
            </ul>
          </div>

          {/* Company Links – All using Link */}
          <div>
            <h4 className="mb-3 font-semibold text-slate-800 dark:text-white">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">About</Link></li>
              <li><Link to="/contact" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Contact</Link></li>
              <li><Link to="/privacy" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-12 border-t border-slate-200/50 dark:border-slate-700/50 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {currentYear} SkillSwap Hub. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Made with passion
            </span>
            <span className="hidden sm:inline">•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;