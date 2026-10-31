'use client';

import { Menu, Bell } from 'lucide-react';

interface TopbarProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export default function Topbar({ pageTitle, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-sm">
      {/* Left — hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 leading-tight">{pageTitle}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            PhishGuard — Phishing Email Detector
          </p>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <button
          type="button"
          className="relative p-2.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {/* Brand pill */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-sm shadow-cyan-500/30">
            <span className="text-white font-bold text-xs">PG</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">PhishGuard</p>
            <p className="text-[10px] text-cyan-500 uppercase tracking-widest">Dashboard</p>
          </div>
        </div>
      </div>
    </header>
  );
}

