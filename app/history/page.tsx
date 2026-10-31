import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Scan History' };

export default function HistoryPage() {
  return (
    <DashboardLayout pageTitle="Scan History">
      <h1 className="text-2xl font-bold text-slate-800">Scan History</h1>
    </DashboardLayout>
  );
}

