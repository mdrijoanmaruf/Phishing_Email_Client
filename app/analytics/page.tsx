import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <DashboardLayout pageTitle="Analytics">
      <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
    </DashboardLayout>
  );
}
