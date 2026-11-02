'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BarChart2,
  TrendingUp,
  RefreshCw,
  Globe,
  Tag,
  ShieldAlert,
  Layers,
  Table,
  Info,
  History,
} from 'lucide-react';
import {
  getAnalyticsSummary,
  getScoresStatistics,
  getTopKeywords,
  getDomainBreakdown,
  AnalyticsSummary,
  ScoresStatistics,
  KeywordItem,
  DomainItem,
} from '@/lib/api';
import { showErrorAlert } from '@/lib/alerts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [scores, setScores] = useState<ScoresStatistics | null>(null);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [domains, setDomains] = useState<DomainItem[]>([]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [sumData, scoreData, kwData, domData] = await Promise.all([
        getAnalyticsSummary(),
        getScoresStatistics(),
        getTopKeywords(),
        getDomainBreakdown(),
      ]);
      setSummary(sumData);
      setScores(scoreData);
      setKeywords(kwData);
      setDomains(domData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load analytics';
      showErrorAlert('Analytics Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const datasetColumns = [
    {
      name: 'label',
      type: 'Integer (0 | 1)',
      badge: 'Classification Target',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Ground truth classification: 1 indicates Phishing, 0 indicates Safe/Legitimate.',
    },
    {
      name: 'sender',
      type: 'Text String',
      badge: 'Origin Header',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Sender email address and display name used to trace origins and extract sender domains.',
    },
    {
      name: 'subject',
      type: 'Text String',
      badge: 'Header Content',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Email subject line analyzed for urgency triggers, threat cues, and capitalization patterns.',
    },
    {
      name: 'body',
      type: 'Multiline Text',
      badge: 'Payload Content',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Full message text inspected for suspicious keywords, deceptive phrases, and call-to-actions.',
    },
    {
      name: 'domain',
      type: 'Hostname',
      badge: 'Extracted Entity',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Extracted root domain cross-referenced against the active blacklist and high-risk domain registries.',
    },
    {
      name: 'urls',
      type: 'Array of Links',
      badge: 'Extracted Links',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      description: 'Collection of external web links and direct IP addresses detected inside the email body.',
    },
    {
      name: 'receiver',
      type: 'Text String',
      badge: 'Recipient Header',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      description: 'Target recipient address or destination mailbox associated with the email record.',
    },
    {
      name: 'date',
      type: 'Date / Timestamp',
      badge: 'Temporal Data',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Chronological timestamp indicating when the email message was originally logged.',
    },
  ];

  return (
    <DashboardLayout pageTitle="Analytics & Dataset Statistics">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* ── 1. Module Header Card ────────────────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    Analytics &amp; Metrics Overview
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    71,000 Records
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
                  Statistical distributions, risk curves, keyword density, and sender domain breakdown
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={fetchAllAnalytics}
                disabled={loading}
                className="w-full sm:w-auto justify-center px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. High-Level Overview Cards (4 Grid) ────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Dataset Scale */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Dataset Scale
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {summary ? summary.total_dataset_records.toLocaleString() : '71,000'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Based on: All records in data.csv</p>
            </div>
          </div>

          {/* Card 2: Phishing Ratio */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phishing Ratio
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold text-red-600 tracking-tight">
                {summary ? `${summary.phishing_percentage}%` : '55.8%'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Column: <span className="font-semibold text-gray-600">label</span> (1 vs 0)
              </p>
            </div>
          </div>

          {/* Card 3: History Scans */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                History
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {summary ? summary.total_scans_performed : 0}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Logged in: history.json</p>
            </div>
          </div>

          {/* Card 4: Blocked Domains */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Blocked Domains
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {summary ? summary.blacklisted_domains_count : 8}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Registry: <span className="font-semibold text-gray-600">blacklist.json</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. Analyzed Dataset Columns Section ──────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Analyzed Dataset Columns ({datasetColumns.length} Fields)</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                The core data structure and attributes evaluated across our phishing analysis pipeline
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-center shrink-0">
              CSV Schema
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 pt-1">
            {datasetColumns.map((col) => (
              <div
                key={col.name}
                className="p-3.5 sm:p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-indigo-200 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">
                    {col.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${col.badgeColor}`}
                  >
                    {col.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Type: {col.type}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{col.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Statistical Risk Score Metrics ────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Statistical Risk Score Metrics</span>
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on: label, subject, body
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Distribution parameters calculated across evaluated records based on the{' '}
                <span className="font-semibold text-gray-700 font-mono">label</span> classification,
                with risk weights from <span className="font-semibold text-gray-700 font-mono">subject</span> and{' '}
                <span className="font-semibold text-gray-700 font-mono">body</span>.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium shrink-0 self-start md:self-center">
              Sample size: {scores?.sample_size || 1000}
            </span>
          </div>

          {/* Responsive Metrics Grid (2 cols on mobile, 3 on tablet, 6 on desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-1">
            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">Mean Score</span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight">
                {scores ? scores.mean : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Average Score</span>
            </div>

            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">
                Std Deviation
              </span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight">
                {scores ? scores.std : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Spread &amp; Variance</span>
            </div>

            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">Median</span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight">
                {scores ? scores.median : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">50th Percentile</span>
            </div>

            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">
                25th Percentile
              </span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight">
                {scores ? scores.p25 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Lower Quartile</span>
            </div>

            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">
                75th Percentile
              </span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight">
                {scores ? scores.p75 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Upper Quartile</span>
            </div>

            <div className="bg-gray-50/80 p-3 sm:p-3.5 rounded-xl border border-gray-100">
              <span className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-semibold block">Score Range</span>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 mt-1 block tracking-tight truncate">
                {scores ? `${scores.min}–${scores.max}` : '0–100'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Min to Max</span>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2 pt-1 text-[11px] text-gray-500 bg-gray-50/70 p-2.5 sm:p-3 rounded-xl border border-gray-100">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">
              <strong className="text-gray-700">Data Source Attribution:</strong> Metrics computed across evaluated dataset records based on <span className="font-mono font-semibold text-indigo-700">label</span> (ground truth), <span className="font-mono font-semibold text-indigo-700">subject</span> (header indicators), and <span className="font-mono font-semibold text-indigo-700">body</span> (content risk factors).
            </span>
          </div>
        </div>

        {/* ── 5. Score Distribution Histogram ─────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Risk Score Distribution Histogram</span>
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on: label, body, subject
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Frequency distribution of evaluated emails grouped into 10-point risk score intervals
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-gray-500 mt-1 sm:mt-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Safe (0–39)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Suspicious (40–69)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Phishing (70–100)
              </span>
            </div>
          </div>

          {scores?.histogram && (
            <div className="overflow-x-auto custom-scrollbar pt-2 pb-1">
              <div className="min-w-[460px] sm:min-w-0 space-y-2">
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2 items-end h-40 sm:h-44 pb-2 border-b border-gray-100">
                  {scores.histogram.map((bin, idx) => {
                    const maxCount = Math.max(...scores.histogram.map((h) => h.count)) || 1;
                    const heightPercent = Math.max(6, Math.round((bin.count / maxCount) * 100));
                    const isSafe = idx < 4;
                    const isSuspicious = idx >= 4 && idx < 7;
                    const barColor = isSafe
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : isSuspicious
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-red-500 hover:bg-red-600';

                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group cursor-pointer">
                        <span className="text-[10px] font-bold text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {bin.count}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                          style={{ height: `${heightPercent}%` }}
                          title={`${bin.range}: ${bin.count} samples (${bin.percentage}%)`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Histogram Labels */}
                <div className="grid grid-cols-10 gap-1.5 sm:gap-2 text-center">
                  {scores.histogram.map((bin, idx) => (
                    <span key={idx} className="text-[10px] sm:text-[11px] font-mono text-gray-400 truncate">
                      {bin.range}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 6. 2-Column Grid: Keywords and Domains ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Top Phishing Keywords */}
          <div className="lg:col-span-6 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Most Frequent Phishing Keywords</span>
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on: body, subject
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Keywords detected in <span className="font-semibold text-gray-700 font-mono">body</span> and{' '}
                <span className="font-semibold text-gray-700 font-mono">subject</span> of phishing emails (<span className="font-mono font-semibold text-red-600">label = 1</span>).
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {keywords.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs gap-2">
                    <span className="font-semibold text-gray-800 capitalize font-mono truncate">
                      #{idx + 1} {item.keyword}
                    </span>
                    <span className="text-gray-500 font-medium shrink-0 text-[11px] sm:text-xs">
                      {item.count.toLocaleString()} <span className="hidden xs:inline">occurr.</span> ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.percentage * 1.5 + 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sender Domains Breakdown */}
          <div className="lg:col-span-6 bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Phishing Sender Domain Breakdown</span>
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on: sender, domain, label
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Origin domains extracted from <span className="font-semibold text-gray-700 font-mono">sender</span> column for records flagged as phishing (<span className="font-mono font-semibold text-red-600">label = 1</span>).
              </p>
            </div>

            <div className="overflow-x-auto custom-scrollbar pt-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3 text-right">Phishing Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {domains.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-800 truncate max-w-[180px] sm:max-w-[240px]">
                        {item.domain}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 text-[11px]">
                          {item.phishing_count.toLocaleString()} emails
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
