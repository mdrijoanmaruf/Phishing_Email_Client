'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  ScanLine,
  BarChart2,
  ShieldBan,
  History,
  ShieldAlert,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard',  label: 'Dashboard',    Icon: LayoutDashboard, exact: true },
  { href: '/dataset',    label: 'Dataset',       Icon: Database },
  { href: '/scan',       label: 'Scan Email',    Icon: ScanLine },
  { href: '/analytics',  label: 'Analytics',     Icon: BarChart2 },
  { href: '/blacklist',  label: 'Blacklist',     Icon: ShieldBan },
  { href: '/history',    label: 'Scan History',  Icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-[#0f172a] flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Logo header ───────────────────────────────────────── */}
        <div className="h-20 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            {/* Shield icon as logo */}
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">PhishGuard</h1>
              <p className="text-cyan-400 text-[10px] uppercase tracking-widest">Detector</p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navigation ────────────────────────────────────────── */}
        <nav
          className="flex-1 px-3 py-6 overflow-y-auto sidebar-scroll"
          role="navigation"
          aria-label="Main navigation"
        >
          <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Menu
          </p>

          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item);
              const { Icon } = item;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl
                      text-sm font-medium transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                      ${
                        active
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        active ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400'
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>

                    {/* Badge */}
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Footer ────────────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0">
          <div className="px-3 py-2.5 rounded-xl bg-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Backend</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-300 text-xs font-medium">Flask API · localhost:5000</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

