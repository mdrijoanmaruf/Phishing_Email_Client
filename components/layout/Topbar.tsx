'use client';

import { Menu } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function Topbar({ pageTitle, subtitle, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 sm:h-20 bg-white border-b border-gray-100 sticky top-0 z-30 px-3.5 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 sm:p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{pageTitle}</h2>
          {subtitle && (
            <p className="text-xs text-gray-400 hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* User Info (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-semibold shadow-sm">
            A
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">Security Analyst</p>
            <p className="text-xs text-indigo-600 font-medium">Administrator</p>
          </div>
        </div>

        {/* User Avatar (Mobile) */}
        <div className="lg:hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
