import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen p-6 pt-24 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Contact Us</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">We'd love to hear from you. Reach out anytime.</p>

        <div className="grid grid-cols-1 gap-8 mt-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
              <Mail className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">support@skillswap.com</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
              <Phone className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">+1-800-123-4567</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">123 Learning Lane, Knowledge City</span>
            </div>
            <div className="flex gap-4 p-4 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
              <a href="#" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">GitHub</a>
              <a href="#" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">LinkedIn</a>
              <a href="#" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">Twitter</a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-xl border-slate-200/50 dark:border-slate-700/50">
            <input
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2 mb-3 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-2 mb-3 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              className="w-full px-4 py-2 mb-3 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <textarea
              rows="4"
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className="w-full px-4 py-2 mb-3 bg-white border rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-2.5 text-white transition bg-indigo-600 shadow-md hover:bg-indigo-700 rounded-xl"
            >
              <Send className="w-4 h-4" /> {submitted ? 'Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;