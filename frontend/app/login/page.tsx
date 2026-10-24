'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';
  const isFromCheckout = returnUrl.includes('checkout');

  const { login, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push(returnUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
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
          <h1 className="text-xl font-serif font-bold text-[#13231D] mt-2">
            Welcome to Your Account
          </h1>
          <p className="text-xs text-[#73756F] mt-1">
            Sign in to track orders, save delivery addresses, and expedite checkout.
          </p>
        </div>

        {/* Notice if redirected from checkout */}
        {isFromCheckout && (
          <div className="mb-6 p-4 rounded-xl bg-[#FAF8F5] border border-[#78836A]/30 text-[#13231D] flex items-start gap-3 shadow-xs">
            <ShoppingBag className="text-[#78836A] shrink-0 mt-0.5" size={18} />
            <div className="text-xs">
              <span className="font-semibold block text-[#13231D] mb-0.5">
                Authentication Required for Checkout
              </span>
              Please sign in to proceed with your order. Your shopping bag items are saved safely.
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E5DE] p-6 sm:p-8">
          {(error || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#73756F] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-email"
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#73756F]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#78836A] hover:text-[#667151] transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider & Registration Prompt */}
          <div className="mt-6 pt-6 border-t border-[#E8E5DE] text-center">
            <p className="text-xs text-[#73756F]">
              New to Ergocraft?{' '}
              <Link
                href={`/register${returnUrl !== '/account' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`}
                className="font-semibold text-[#78836A] hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#73756F]">
          <ShieldCheck size={14} className="text-emerald-700" />
          <span>Encrypted 256-bit TLS connection &bull; Secure session</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <LoginForm />
    </Suspense>
  );
}
