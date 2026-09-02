import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(email.trim());

      setMessage(
        response?.data?.message ||
          'Password reset email sent successfully.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to send password reset email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">

      <div className="w-full max-w-md p-8 bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">

        {/* Header */}
        <div className="mb-8 text-center">

          <div className="flex items-center justify-center mx-auto mb-4 text-white bg-indigo-600 w-14 h-14 rounded-2xl">
            <Mail className="w-7 h-7" />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email and we'll send you a password reset link.
          </p>

        </div>

        {/* Success Message */}
        {message && (
          <div className="p-3 mb-5 text-sm border rounded-xl text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 mb-5 text-sm border rounded-xl text-rose-700 border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-white border outline-none text-slate-800 rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

        </form>

        {/* Back to Login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 mt-6 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

      </div>

    </div>
  );
};

export default ForgotPassword;
