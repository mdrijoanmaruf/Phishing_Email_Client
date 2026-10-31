'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Bell, ChevronLeft, ShieldCheck } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export default function Topbar({ pageTitle, onMenuClick }: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="h-20 bg-white border-b border-gray-100 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{pageTitle}</h2>
          <p className="text-xs text-gray-400 hidden sm:block">
            PhishGuard Anti-Phishing System
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <Link
          href="/history"
          className="relative p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Recent Scans"
          title="Recent Scans"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            2
          </span>
        </Link>

        {/* User Avatar (Mobile) */}
        <div className="lg:hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
        </div>

        {/* User Menu (Desktop) */}
        <div ref={userMenuRef} className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 p-2 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-expanded={userMenuOpen ? 'true' : 'false'}
            aria-haspopup="menu"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-semibold shadow-sm">
                A
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">Security Analyst</p>
                <p className="text-xs text-indigo-600 font-medium">Administrator</p>
              </div>
            </div>
            <span
              className={`text-gray-400 ml-2 transition-transform duration-200 ${
                userMenuOpen ? '-rotate-90' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1"
              role="menu"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800">System Ready</p>
                <p className="text-[11px] text-gray-500">v1.0 Rule-based Engine</p>
              </div>
              <Link
                href="/scan"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                role="menuitem"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Scan Email
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
