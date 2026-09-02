import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, user, loading } = useAuth();

  // Hooks MUST run before conditional returns.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) {
    // Deliberately send every already-authenticated user to the normal dashboard.
    // Admins can open /admin from the profile menu.
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    const result = await loginUser(formData.email.trim(), formData.password);

    if (!result.success) {
      setError(result.message || 'Login failed.');
      setIsLoading(false);
      return;
    }

    // IMPORTANT: Login never redirects to /admin automatically.
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mx-auto mb-4 text-white bg-indigo-600 w-14 h-14 rounded-2xl">
            <LogIn className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Login to your SkillSwap Hub account
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full px-4 py-3 transition bg-white border outline-none rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 pr-12 transition bg-white border outline-none rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute -translate-y-1/2 right-3 top-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Login
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
