import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmail } from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (!mounted) return;
        setStatus('success');
        setMessage(response?.data?.message || 'Email verified successfully.');
      } catch (error) {
        if (!mounted) return;
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            'This verification link is invalid or expired.'
        );
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md p-8 text-center bg-white border shadow-xl dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800">
        {status === 'loading' && (
          <Loader2 className="mx-auto mb-5 text-indigo-600 w-14 h-14 animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle2 className="mx-auto mb-5 w-14 h-14 text-emerald-500" />
        )}
        {status === 'error' && (
          <XCircle className="mx-auto mb-5 w-14 h-14 text-rose-500" />
        )}

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {status === 'loading'
            ? 'Verifying Email'
            : status === 'success'
              ? 'Email Verified'
              : 'Verification Failed'}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {message}
        </p>

        {status !== 'loading' && (
          <Link
            to="/login"
            className="block w-full px-4 py-3 mt-6 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
