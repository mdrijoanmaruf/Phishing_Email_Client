import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const metadata: Metadata = { title: 'Dataset' };

export default function DatasetPage() {
  return (
    <DashboardLayout pageTitle="Dataset">
      <h1 className="text-2xl font-bold text-slate-800">Dataset</h1>
    </DashboardLayout>
  );
}
