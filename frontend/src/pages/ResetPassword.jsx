import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });

      setMessage(
        data.message ||
          'Password reset successfully. Please log in again.'
      );

      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset password'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex">

        {/* LEFT SIDE */}
        <div className="hidden lg:flex lg:w-1/2 bg-brand-600 text-white">
          <div className="flex w-full items-center justify-center px-12 xl:px-20">
            <div className="max-w-lg">

              {/* Brand */}
              <div className="mb-10">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl font-bold">
                    H
                  </div>

                  <span className="text-2xl font-bold">
                    Helpdesk
                  </span>
                </div>

                <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
                  Secure your
                  <br />
                  account again.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                  Create a new password and get back to
                  managing your support tickets securely.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-5">

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Create a strong password
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Use at least 8 characters and include a number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Secure password reset
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Your password reset link can only be used once.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Continue using Helpdesk
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Sign in with your new password once the reset is complete.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
                H
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Helpdesk
              </h1>
            </div>

            {/* Reset Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Reset your password
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter a new password for your Helpdesk account.
                </p>
              </div>

              {message && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm leading-5 text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* New Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Create a new password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 8 characters and at least 1 number.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your new password"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? 'Resetting password…'
                    : 'Reset Password'}
                </button>

              </form>

              {/* Back to Login */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}