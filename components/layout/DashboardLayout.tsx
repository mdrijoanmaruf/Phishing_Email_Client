'use client';

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Fixed sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content pushed right on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Topbar pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-4 lg:px-8 py-4 border-t border-slate-200 bg-white">
          <p className="text-xs text-slate-400 text-center">
            PhishGuard &copy; {new Date().getFullYear()} — CSC 4162 Python Programming Project
          </p>
        </footer>
      </div>
    </div>
  );
}

