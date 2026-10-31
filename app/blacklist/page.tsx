import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Blacklist' };

export default function BlacklistPage() {
  return (
    <DashboardLayout pageTitle="Blacklist">
      <h1 className="text-2xl font-bold text-slate-800">Blacklist</h1>
    </DashboardLayout>
  );
}
