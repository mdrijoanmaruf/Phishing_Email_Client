'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  BarChart2,
  ShieldBan,
  History,
  X,
  Server,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/dataset', label: 'Dataset', Icon: Database },
  { href: '/analytics', label: 'Analytics', Icon: BarChart2 },
  { href: '/blacklist', label: 'Blacklist', Icon: ShieldBan },
  { href: '/history', label: 'History', Icon: History },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen w-60 bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="h-full flex flex-col relative">
        <div className="h-20 px-6 flex items-center justify-between border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-900/30">
              PG
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PhishGuard</h1>
              <p className="text-[10px] text-indigo-600 uppercase tracking-wider font-semibold">
                Security Panel
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          className="flex-1 px-4 py-6 overflow-y-auto pb-28"
          role="navigation"
          aria-label="Sidebar navigation"
        >
          <p className="px-4 mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== '/';
              const { Icon } = item;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-lg shadow-indigo-900/30'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                          isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
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

        <div className="absolute left-4 right-4 bottom-5">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 w-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate">Flask API (5000)</span>
              </div>
              <Link
                href="/dataset"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Dataset (71k)</span>
                <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
