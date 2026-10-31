'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { fetchApi, resolveApiUrl } from '../lib/api';
import {
  LayoutDashboard,
  Armchair,
  FolderTree,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Activity,
  ChevronRight,
  ShieldCheck,
  Banknote,
  Loader2,
  Truck,
  Percent,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [codEnabled, setCodEnabled] = useState<boolean>(true);
  const [togglingCod, setTogglingCod] = useState<boolean>(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? 'https://ergo-craft.vercel.app'
      : 'http://localhost:3000');

  useEffect(() => {
    const checkHealthAndSettings = async () => {
      try {
        const res = await fetch(resolveApiUrl('/health'));
        setServerOnline(res.ok);
      } catch {
        setServerOnline(false);
      }

      try {
        const res = await fetchApi<{ codEnabled: boolean }>('/settings');
        if (typeof res.data?.codEnabled === 'boolean') {
          setCodEnabled(res.data.codEnabled);
        }
      } catch {
        // Fallback default
      }
    };

    checkHealthAndSettings();
    const interval = setInterval(checkHealthAndSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleCod = async () => {
    if (togglingCod) return;
    setTogglingCod(true);
    const nextVal = !codEnabled;
    try {
      const res = await fetchApi<{ codEnabled: boolean }>('/settings', {
        method: 'PATCH',
        body: JSON.stringify({ codEnabled: nextVal }),
      });
      setCodEnabled(res.data.codEnabled);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update COD settings.');
    } finally {
      setTogglingCod(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#667151] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-[#78716C] tracking-wide">Loading Ergocraft Portal...</p>
        </div>
        {/* Keep children mounted in a hidden container so Next.js instant navigation validation can validate route segments */}
        <div className="hidden" aria-hidden="true">
          {children}
        </div>
      </div>
    );
  }

  // If on login page, don't show the admin layout
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Products', href: '/products', icon: Armchair },
    { label: 'Categories', href: '/categories', icon: FolderTree },
    { label: 'Orders', href: '/orders', icon: ShoppingBag },
    { label: 'Delivery Restrictions', href: '/delivery', icon: Truck },
    { label: 'Chair Discounts', href: '/discounts', icon: Percent },
  ];

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-[#1E1B18]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1E1B18] text-white flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#FAF8F5] flex items-center justify-center p-1 overflow-hidden shrink-0">
              <img
                src="/images/logo.png"
                alt="Ergocraft Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-lg tracking-wider font-semibold text-[#899478]">
                ERGOCRAFT
              </h1>
              <span className="text-[10px] tracking-widest uppercase text-white/50 block -mt-0.5">
                ADMIN PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-[#667151] text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-white/60'} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider"
            >
              <ExternalLink size={17} />
              <span>View Storefront</span>
            </a>
          </div>
        </nav>

        {/* Cash on Delivery (COD) Control Switch */}
        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-[#899478]" />
              <span className="text-xs font-semibold text-white">COD Option</span>
            </div>
            <button
              onClick={handleToggleCod}
              disabled={togglingCod}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                codEnabled ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
              title={`Click to turn COD ${codEnabled ? 'OFF' : 'ON'}`}
            >
              {togglingCod ? (
                <Loader2 size={12} className="animate-spin text-white mx-auto" />
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    codEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span>Storefront Checkout</span>
            <span
              className={`px-1.5 py-0.5 rounded font-mono font-semibold text-[10px] ${
                codEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {codEnabled ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
            </span>
          </div>
        </div>

        {/* System Status & Admin Profile */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between text-xs text-white/60 mb-3 px-1">
            <span className="flex items-center gap-1.5">
              <Activity size={12} className={serverOnline ? 'text-emerald-400' : 'text-rose-400'} />
              API Server
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                serverOnline
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {serverOnline ? 'Online (5000)' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="truncate mr-2">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 rounded text-white/60 hover:text-rose-400 hover:bg-white/5 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header with COD Quick Switch */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E8E2D9] px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="font-serif font-semibold tracking-wider text-[#667151] lg:hidden">ERGOCRAFT</span>
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-800">Admin Control Panel</span>
              <span>•</span>
              <span>Ergocraft Seating Systems</span>
            </div>
          </div>

          {/* Quick COD Toggle in Top Header */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#E8E2D9] px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <Banknote size={15} className="text-[#667151]" />
                <span className="hidden sm:inline">Cash on Delivery:</span>
                <span className="sm:hidden">COD:</span>
              </div>
              <button
                onClick={handleToggleCod}
                disabled={togglingCod}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  codEnabled
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                }`}
                title="Toggle Cash on Delivery ON / OFF"
              >
                {togglingCod && <Loader2 size={12} className="animate-spin" />}
                <span>{codEnabled ? 'ON (Active)' : 'OFF (Disabled)'}</span>
              </button>
            </div>

            <span className="text-xs text-gray-500 hidden sm:inline">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
