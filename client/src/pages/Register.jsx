import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const result = await registerUser(
      formData.name.trim(),
      formData.username.trim(),
      formData.email.trim(),
      formData.password
    );

    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Registration failed.');
      return;
    }

    // Registration does NOT log the user in anymore.
    setRegistered(true);
    setSuccess(
      result.message ||
        'Registration successful. Please verify your email before logging in.'
    );
  };

  if (registered) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md p-8 text-center bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-center mx-auto mb-5 text-white bg-emerald-500 w-14 h-14 rounded-2xl">
            <MailCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Check Your Email
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {success}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full px-4 py-3 mt-6 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Create Account</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Start your learning journey today
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 mb-4 text-sm border bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50 text-rose-700 dark:text-rose-300 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['name', 'Full Name', 'Your Name', 'text'],
            ['username', 'Username', 'username', 'text'],
            ['email', 'Email Address', 'you@example.com', 'email'],
            ['password', 'Password', '••••••••', 'password'],
            ['confirmPassword', 'Confirm Password', '••••••••', 'password'],
          ].map(([name, label, placeholder, type]) => (
            <div key={name}>
              <label className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                minLength={type === 'password' ? 6 : undefined}
                autoComplete={name === 'email' ? 'email' : undefined}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                placeholder={placeholder}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
