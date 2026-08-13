import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-screen flex">

        {/* LEFT SIDE - BRANDING */}
        <div className="hidden lg:flex lg:w-1/2 bg-brand-600 text-white">
          <div className="flex w-full items-center justify-center px-12 xl:px-20">
            <div className="max-w-lg">

              {/* Logo / Brand */}
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
                  Support your customers
                  <br />
                  faster and smarter.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                  Manage support tickets, resolve customer issues,
                  and keep your support team organized in one place.
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
                      Manage support tickets
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Track and manage customer requests from one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Track customer issues
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Keep every issue organized with status and priority.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Work better as a team
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Assign tickets and keep your support workflow moving.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN */}
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

            {/* Login Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to continue to your Helpdesk account.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Password input + toggle */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      title={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? (
                        /* Eye with slash */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.58 10.58a2 2 0 002.84 2.84"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.88 4.24A10.45 10.45 0 0112 4c5 0 8.5 4 9.5 6a11.7 11.7 0 01-2.08 3.03"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.61 6.61C4.62 7.89 3.38 9.61 2.5 11c1 2 4.5 6 9.5 6 1.61 0 3.02-.4 4.25-1.03"
                          />
                        </svg>
                      ) : (
                        /* Eye */
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="2.5"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>

              </form>

              {/* Register */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Register
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