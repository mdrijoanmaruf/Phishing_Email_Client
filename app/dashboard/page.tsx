import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
    </DashboardLayout>
  );
}
