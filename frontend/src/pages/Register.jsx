import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      await register(
        form.name,
        form.email,
        form.password
      );

      navigate('/');
    } catch (err) {
      const details = err.response?.data?.errors;

      setError(
        details
          ? details.map((d) => d.message).join(', ')
          : err.response?.data?.message ||
              'Registration failed'
      );
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
                  Get started with
                  <br />
                  better support.
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                  Create your Helpdesk account and start
                  managing your support requests in one place.
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
                      Submit support requests
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Create and track your support tickets easily.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Track your tickets
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Stay updated on the progress of your requests.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                    ✓
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Get faster support
                    </h3>

                    <p className="mt-1 text-sm text-white/70">
                      Keep communication organized with your support team.
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

            {/* Registration Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter below details to register as a customer.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name
                  </label>

                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  {/* Password input + toggle */}
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
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

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 8 characters and at least 1 number.
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy
                    ? 'Creating account…'
                    : 'Create account'}
                </button>

              </form>

              {/* Login */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}

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