'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Database,
  BarChart2,
  ShieldBan,
  History,
  ArrowRight,
  Activity,
  Layers,
  Globe,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { getAnalyticsSummary, getHistory, AnalyticsSummary, ScanResult } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sum, hist] = await Promise.all([
          getAnalyticsSummary().catch(() => null),
          getHistory(undefined, 5).catch(() => ({ data: [] })),
        ]);
        if (sum) setSummary(sum);
        if (hist?.data) setRecentScans(hist.data);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const modules = [
    {
      title: 'Dataset Management',
      href: '/dataset',
      icon: Database,
      badge: '71,000 Records',
      desc: 'Browse, filter, add, edit, and export 71,000 email records across phishing and safe categories.',
    },
    {
      title: 'Sender Blacklist',
      href: '/blacklist',
      icon: ShieldBan,
      badge: `${summary?.blacklisted_domains_count || 7} Domains`,
      desc: 'Manage blocked malicious sender domains with instant O(1) set matching.',
    },
    {
      title: 'Analytics & NumPy Stats',
      href: '/analytics',
      icon: BarChart2,
      badge: 'NumPy & pandas',
      desc: 'Deep-dive into score statistics (mean, std, percentiles) and keyword frequency distributions.',
    },
    {
      title: 'Scan Audit History',
      href: '/history',
      icon: History,
      badge: `${summary?.total_scans_performed || recentScans.length} Scans`,
      desc: 'Audit trail of past scanned emails with full explanation logs and JSON persistence.',
    },
  ];

  return (
    <DashboardLayout pageTitle="System Overview & Control Center">
      <div className="space-y-6 max-w-7xl">
        {/* Welcome Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">PhishGuard Security Overview</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  API Online
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Phishing email security analytics and 71,000-record dataset explorer (CSC 4162 Project)
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/dataset"
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 transition-all flex items-center gap-1.5"
              >
                <Database className="w-4 h-4" />
                Browse Dataset
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Dataset */}
          <Link
            href="/dataset"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Dataset Scale
              </span>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.total_dataset_records.toLocaleString() : '71,000'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Records in memory</p>
            </div>
          </Link>

          {/* Card 2: Phishing Ratio */}
          <Link
            href="/analytics"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Phishing Ratio
              </span>
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-red-600">
                {summary ? `${summary.phishing_percentage}%` : '55.8%'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {summary ? `${summary.phishing_count.toLocaleString()} emails` : '39,607 Phishing'}
              </p>
            </div>
          </Link>

          {/* Card 3: Scans Performed */}
          <Link
            href="/history"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Audited Scans
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.total_scans_performed : recentScans.length}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Persisted to history</p>
            </div>
          </Link>

          {/* Card 4: Blacklisted Domains */}
          <Link
            href="/blacklist"
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Blacklisted Domains
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.blacklisted_domains_count : 7}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">O(1) Set lookup</p>
            </div>
          </Link>
        </div>

        {/* 2-Column: Modules & Recent Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Module Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Platform Modules</h2>
                <span className="text-xs text-gray-400">All Modules Operational</span>
              </div>

              <div className="space-y-3">
                {modules.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="p-3.5 rounded-lg border border-gray-100 hover:border-indigo-200 bg-gray-50/50 hover:bg-indigo-50/30 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-700 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <m.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {m.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scans Widget */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  Recent Scans
                </h2>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading recent scans...</div>
              ) : recentScans.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  No audit history records found.{' '}
                  <Link href="/dataset" className="text-indigo-600 font-semibold hover:underline">
                    Explore dataset
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentScans.map((scan) => {
                    const isSafe = scan.verdict === 'SAFE';
                    const isSuspicious = scan.verdict === 'SUSPICIOUS';
                    const badgeClass = isSafe
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isSuspicious
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200';

                    return (
                      <div
                        key={scan.id}
                        className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate" title={scan.subject}>
                            {scan.subject || scan.sender || 'Email Scan'}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {scan.domain || scan.sender || 'Domain unverified'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-gray-800">{scan.score}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                            {scan.verdict}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
