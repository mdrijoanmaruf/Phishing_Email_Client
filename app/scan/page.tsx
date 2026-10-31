import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Scan Email' };

export default function ScanPage() {
  return (
    <DashboardLayout pageTitle="Scan Email">
      <h1 className="text-2xl font-bold text-slate-800">Scan Email</h1>
    </DashboardLayout>
  );
}
