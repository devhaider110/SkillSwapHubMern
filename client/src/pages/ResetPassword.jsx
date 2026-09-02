import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="mx-auto mb-5 w-14 h-14 text-emerald-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Password Reset Successful</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Your password has been updated. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 text-white bg-indigo-600 w-14 h-14 rounded-2xl">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reset Password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Choose a new password for your account.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm border text-rose-700 border-rose-200 rounded-xl bg-rose-50 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="New password"
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-white border outline-none rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm new password"
            autoComplete="new-password"
            className="w-full px-4 py-3 bg-white border outline-none rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <Link
          to="/login"
          className="block mt-6 text-sm text-center text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
