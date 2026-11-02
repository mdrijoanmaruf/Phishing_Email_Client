'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  ShieldAlert,
  Database,
  BarChart2,
  ShieldBan,
  History,
  ArrowRight,
  Layers,
  Globe,
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
          getHistory(undefined, undefined, 5).catch(() => ({ data: [] })),
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
      title: 'Analytics & Metrics',
      href: '/analytics',
      icon: BarChart2,
      badge: 'Statistical Analysis',
      desc: 'Deep-dive into score statistics, risk distributions, analyzed dataset columns, and keyword frequency metrics.',
    },
    {
      title: 'History',
      href: '/history',
      icon: History,
      badge: 'Action Logs',
      desc: 'Track all Add, Edit, Delete, View, and Blacklist operations persisted to history.json.',
    },
  ];

  return (
    <DashboardLayout pageTitle="System Overview">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  PhishGuard Security Overview
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  API Online
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Phishing email security analytics and 71,000-record dataset explorer (CSC 4162 Project)
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 sm:self-center shrink-0 w-full sm:w-auto">
              <Link
                href="/dataset"
                className="w-full sm:w-auto justify-center px-4 py-2.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Browse Dataset</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Dataset */}
          <Link
            href="/dataset"
            className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-indigo-100 active:scale-[0.99] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Dataset Scale
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight block">
                {summary ? summary.total_dataset_records.toLocaleString() : '71,000'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Records in memory</p>
            </div>
          </Link>

          {/* Card 2: Phishing Ratio */}
          <Link
            href="/analytics"
            className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-red-100 active:scale-[0.99] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Phishing Ratio
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-semibold text-red-600 tracking-tight block">
                {summary ? `${summary.phishing_percentage}%` : '55.8%'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                {summary ? `${summary.phishing_count.toLocaleString()} emails` : '39,607 Phishing'}
              </p>
            </div>
          </Link>

          {/* Card 3: History */}
          <Link
            href="/history"
            className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-100 active:scale-[0.99] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                History
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight block">
                {summary ? summary.total_scans_performed : recentScans.length}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">Persisted history records</p>
            </div>
          </Link>

          {/* Card 4: Blacklisted Domains */}
          <Link
            href="/blacklist"
            className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-amber-100 active:scale-[0.99] transition-all group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
                Blacklisted Domains
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight block">
                {summary ? summary.blacklisted_domains_count : 7}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">O(1) Set lookup</p>
            </div>
          </Link>
        </div>

        {/* 2-Column: Modules & Recent Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Module Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 md:p-6 shadow-sm space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900">Platform Modules</h2>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                  All Operational
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {modules.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="p-3 sm:p-3.5 rounded-xl border border-gray-100 hover:border-indigo-200 bg-gray-50/50 hover:bg-indigo-50/30 active:scale-[0.99] transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-white border border-gray-200/80 flex items-center justify-center text-indigo-700 shadow-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <m.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                            {m.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-gray-600 border border-gray-200 shrink-0">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* History Widget */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 md:p-6 shadow-sm space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <span>History</span>
                </h2>
                <Link
                  href="/history"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-indigo-50 shrink-0"
                >
                  <span>View All</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading history...</div>
              ) : recentScans.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>No history records found.</p>
                  <Link href="/dataset" className="text-indigo-600 font-semibold hover:underline mt-1 inline-block">
                    Explore dataset
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-2.5">
                  {recentScans.map((item) => {
                    const act = (item.action || 'LOG').toUpperCase();
                    const isBlacklist = act.includes('BLACKLIST');
                    const isAdd = !isBlacklist && (act.includes('ADD') || act.includes('CREATE'));
                    const isEdit = act.includes('EDIT') || act.includes('UPDATE');
                    const isDelete = !isBlacklist && (act.includes('DELETE') || act.includes('REMOVE'));
                    const isView = act.includes('VIEW');
                    const badgeClass = isBlacklist
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : isAdd
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isEdit
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : isDelete
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : isView
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200';

                    return (
                      <div
                        key={item.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-gray-100 bg-gray-50/60 hover:bg-gray-50/90 transition-colors flex items-center justify-between gap-2.5 sm:gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate" title={item.summary}>
                            {item.summary || `${act} operation`}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                            <span className="font-medium text-gray-600 truncate">
                              {item.entity_type} #{item.entity_id}
                            </span>
                            <span>&bull;</span>
                            <span className="truncate">{item.actor || 'Administrator'}</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                            {act}
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
