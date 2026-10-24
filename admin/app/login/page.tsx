'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ergocraft.in');
  const [password, setPassword] = useState('Admin@Ergocraft2026!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#FAF8F5]">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-white shadow-sm border border-[#E8E2D9] p-3 mb-4">
            <img
              src="/images/logo.png"
              alt="Ergocraft Seating"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-wider text-[#1E1B18]">
            ERGOCRAFT
          </h1>
          <p className="text-xs tracking-widest uppercase text-[#667151] font-medium mt-1">
            SEATING PVT. LTD. &bull; ADMIN PORTAL
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E8E2D9] p-8">
          <h2 className="text-lg font-semibold text-[#1E1B18] mb-1">Sign in to your account</h2>
          <p className="text-sm text-[#78716C] mb-6">
            Enter your credentials to access inventory and orders.
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ergocraft.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E8E2D9] bg-[#FAF8F5] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-[#E8E2D9]/60 text-xs text-[#78716C] bg-[#FAF8F5] p-3 rounded-lg">
            <span className="font-semibold text-[#1E1B18] block mb-1">Pre-provisioned Admin Account:</span>
            <div className="font-mono text-[11px] space-y-0.5 text-gray-600">
              <div>Email: admin@ergocraft.in</div>
              <div>Password: Admin@Ergocraft2026!</div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-[#78716C] mt-8">
          &copy; {new Date().getFullYear()} Ergocraft Seating Pvt. Ltd. Confidential.
        </p>
      </div>
    </div>
  );
}
