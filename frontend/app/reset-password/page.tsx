'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please click the recovery link in your email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setSubmitting(true);

    try {
      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The token may be expired or already used.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Brand Heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group mb-3">
            <span className="font-serif-luxury text-3xl font-bold tracking-wider text-[#13231D] group-hover:text-[#78836A] transition">
              ERGOCRAFT
            </span>
            <span className="block text-[10px] tracking-[0.25em] uppercase text-[#73756F]">
              SEATING PVT. LTD.
            </span>
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DE] text-[#78836A] flex items-center justify-center mx-auto mb-3">
            <KeyRound size={22} />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#13231D]">
            Set New Password
          </h1>
          <p className="text-xs text-[#73756F] mt-1">
            Create a robust password to safeguard your Ergocraft profile.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E5DE] p-6 sm:p-8">
          {!token ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-base font-semibold text-[#13231D]">
                Missing Reset Token
              </h2>
              <p className="text-xs text-[#73756F]">
                No reset token was found in your link. Reset links expire after 15 minutes and can only be used once.
              </p>
              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="px-6 py-2.5 rounded-xl bg-[#13231D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#78836A] transition inline-block"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-base font-semibold text-[#13231D]">
                Password Reset Successfully!
              </h2>
              <p className="text-xs text-[#73756F]">
                Your account password has been updated. You can now sign in using your new credentials.
              </p>
              <div className="pt-3">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span>{error}</span>
                    {error.includes('expired') && (
                      <div className="mt-2">
                        <Link
                          href="/forgot-password"
                          className="font-semibold text-rose-800 underline"
                        >
                          Request a fresh reset link &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#73756F] mb-1.5"
                  >
                    New Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#F7F5F0] text-sm text-[#242620] focus:outline-none focus:ring-2 focus:ring-[#78836A] focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#73756F] mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="confirm-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#F7F5F0] text-sm text-[#242620] focus:outline-none focus:ring-2 focus:ring-[#78836A] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <span>{submitting ? 'Updating Password...' : 'Save New Password'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#73756F]">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Single-use token &bull; Atomically invalidated upon completion</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
