'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your account email address.');
      return;
    }

    setSubmitting(true);

    try {
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to process reset request. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
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
            Reset Your Password
          </h1>
          <p className="text-xs text-[#73756F] mt-1 max-w-xs mx-auto">
            Enter the email address associated with your Ergocraft account to receive a secure recovery link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E5DE] p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-base font-semibold text-[#13231D]">
                Recovery Instructions Dispatched
              </h2>
              <p className="text-xs text-[#73756F] leading-relaxed">
                If an account with <strong className="text-[#242620]">{email}</strong> exists in our registry, a single-use password reset link has been dispatched via email.
              </p>
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E5DE] text-[11px] text-[#73756F] text-left">
                <strong>Please Note:</strong> The secure link is valid for <strong>15 minutes</strong>. Remember to check your spam/junk folder if you don&apos;t see it shortly.
              </div>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#13231D] hover:text-[#78836A] transition"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[#73756F] mb-1.5"
                  >
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E5DE] bg-[#F7F5F0] text-sm text-[#242620] focus:outline-none focus:ring-2 focus:ring-[#78836A] focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <span>{submitting ? 'Dispatching Link...' : 'Send Recovery Link'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-[#E8E5DE] text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#73756F] hover:text-[#13231D] transition"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#73756F]">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Anti-enumeration protection &bull; Expiring single-use token</span>
        </div>
      </div>
    </div>
  );
}
