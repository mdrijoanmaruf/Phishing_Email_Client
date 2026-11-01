'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BarChart2,
  TrendingUp,
  Activity,
  RefreshCw,
  Globe,
  Tag,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Table,
  CheckCircle2,
  Info,
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
      <div className="space-y-6 max-w-7xl">
        {/* Module Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">Analytics &amp; Metrics Overview</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    71,000 Records
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comprehensive statistical insights, distribution curves, and sender domain analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchAllAnalytics}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Analytics
              </button>
            </div>
          </div>
        </div>

        {/* High-Level Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dataset Scale */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Dataset Scale
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.total_dataset_records.toLocaleString() : '71,000'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Based on: All records in data.csv</p>
            </div>
          </div>

          {/* Phishing Proportion */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Phishing Ratio
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-red-600">
                {summary ? `${summary.phishing_percentage}%` : '55.8%'}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Based on column: <span className="font-semibold text-gray-600">label</span> (1 vs 0)
              </p>
            </div>
          </div>

          {/* Total Audited Operations */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Audited Operations
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.total_scans_performed : 0}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Based on: data/history.json</p>
            </div>
          </div>

          {/* Blacklisted Domains */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Blocked Domains
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.blacklisted_domains_count : 8}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Based on column: <span className="font-semibold text-gray-600">domain</span></p>
            </div>
          </div>
        </div>

        {/* Analyzed Dataset Columns Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                Analyzed Dataset Columns ({datasetColumns.length} Fields)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                The core data structure and attributes evaluated across our phishing analysis pipeline
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400 self-start sm:self-center">
              Schema Definition
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {datasetColumns.map((col) => (
              <div
                key={col.name}
                className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 hover:bg-white hover:border-indigo-200 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">
                    {col.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${col.badgeColor}`}
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

        {/* Statistical Risk Score Metrics */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Statistical Risk Score Metrics
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on Columns: label, subject, body
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Distribution parameters calculated across evaluated email records based on the{' '}
                <span className="font-semibold text-gray-700 font-mono">label</span> classification
                column, with risk indicators evaluated across the{' '}
                <span className="font-semibold text-gray-700 font-mono">subject</span> and{' '}
                <span className="font-semibold text-gray-700 font-mono">body</span> text.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-medium shrink-0">
              Sample size: {scores?.sample_size || 1000}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Mean Score</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.mean : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Average Score</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                Std Deviation
              </span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.std : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Spread &amp; Variance</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Median</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.median : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">50th Percentile</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                25th Percentile
              </span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.p25 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Lower Quartile</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">
                75th Percentile
              </span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.p75 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Upper Quartile</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Score Range</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? `${scores.min}–${scores.max}` : '0–100'}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Minimum to Maximum</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-500 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              <strong className="text-gray-700">Data Source Attribution:</strong> Metrics computed across evaluated dataset records based on <span className="font-mono font-semibold text-indigo-700">label</span> (ground truth classification), <span className="font-mono font-semibold text-indigo-700">subject</span> (header indicators), and <span className="font-mono font-semibold text-indigo-700">body</span> (content risk factors).
            </span>
          </div>
        </div>

        {/* Score Distribution Histogram */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Risk Score Distribution Histogram
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on Columns: label, body, subject
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Frequency distribution of evaluated emails grouped into 10-point risk score intervals based on{' '}
                <span className="font-semibold text-gray-700 font-mono">label</span> classification and{' '}
                <span className="font-semibold text-gray-700 font-mono">body</span> threat density.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Safe (0–39)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Suspicious (40–69)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Phishing (70–100)
              </span>
            </div>
          </div>

          {scores?.histogram && (
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-10 gap-2 items-end h-44 pb-2 border-b border-gray-100">
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
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bin.count}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${barColor}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${bin.range}: ${bin.count} samples (${bin.percentage}%)`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Labels */}
              <div className="grid grid-cols-10 gap-2 text-center">
                {scores.histogram.map((bin, idx) => (
                  <span key={idx} className="text-[10px] font-mono text-gray-400 truncate">
                    {bin.range}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Keywords and Domains */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Phishing Keywords */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  Most Frequent Phishing Keywords
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on Columns: body, subject
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suspicious keywords and phrases detected in the <span className="font-semibold text-gray-700 font-mono">body</span> and{' '}
                <span className="font-semibold text-gray-700 font-mono">subject</span> columns of phishing emails (where{' '}
                <span className="font-mono font-semibold text-red-600">label = 1</span>).
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {keywords.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800 capitalize font-mono">
                      #{idx + 1} {item.keyword}
                    </span>
                    <span className="text-gray-500 font-medium">
                      {item.count.toLocaleString()} occurrences ({item.percentage}%)
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
          <div className="lg:col-span-6 bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  Phishing Sender Domain Breakdown
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Based on Columns: sender, domain, label
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Origin domains extracted from the <span className="font-semibold text-gray-700 font-mono">sender</span> column for records flagged as phishing (where{' '}
                <span className="font-mono font-semibold text-red-600">label = 1</span>).
              </p>
            </div>

            <div className="overflow-x-auto custom-scrollbar pt-1">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Domain</th>
                    <th className="py-2.5 px-3 text-right">Phishing Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {domains.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-gray-800 truncate max-w-[200px]">
                        {item.domain}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
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
