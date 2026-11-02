'use client';

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, pageTitle, subtitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:ml-60 min-h-screen flex flex-col">
        <Topbar pageTitle={pageTitle} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-3.5 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
