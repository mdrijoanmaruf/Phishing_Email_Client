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
  Percent,
  Calculator,
  Server,
  Layers,
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

  return (
    <DashboardLayout pageTitle="Statistical Analytics & Metrics">
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
                  <h1 className="text-xl font-bold text-gray-900">Analytics &amp; Metrics Engine</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    71,000 Records
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Statistical metrics powered by NumPy arrays and pandas aggregation routines
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
              <p className="text-[11px] text-gray-400 mt-0.5">Multi-source corpus</p>
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
                {summary ? `${summary.phishing_count.toLocaleString()} Phishing vs ${summary.safe_count.toLocaleString()} Safe` : '39,607 Phishing'}
              </p>
            </div>
          </div>

          {/* Total Scans Logged */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Audited Scans
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">
                {summary ? summary.total_scans_performed : 0}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Scanned via RuleEngine</p>
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
                {summary ? summary.blacklisted_domains_count : 7}
              </span>
              <p className="text-[11px] text-gray-400 mt-0.5">Active blacklist set</p>
            </div>
          </div>
        </div>

        {/* NumPy Statistical Cards */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              NumPy Statistical Parameters (<code className="font-mono text-xs">numpy.mean, std, percentile</code>)
            </h2>
            <span className="text-xs text-gray-400">Sample size: {scores?.sample_size || 1000}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Mean Score</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.mean : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">np.mean()</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Std Deviation</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.std : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">np.std()</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Median</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.median : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">np.median()</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">25th Percentile</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.p25 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">p25 (Q1)</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">75th Percentile</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? scores.p75 : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">p75 (Q3)</span>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <span className="text-[11px] text-gray-400 uppercase font-semibold block">Score Range</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">
                {scores ? `${scores.min}–${scores.max}` : '0–100'}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono">min - max</span>
            </div>
          </div>
        </div>

        {/* Histogram & Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Score Distribution Histogram (<code className="font-mono text-xs">numpy.histogram</code> in 10-point bins)
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Safe
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Suspicious
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Phishing
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
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              Most Frequent Phishing Keywords
            </h2>
            <p className="text-xs text-gray-400">
              Suspicious keywords and phrases detected in evaluated email bodies
            </p>

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
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              Phishing Sender Domain Breakdown (<code className="font-mono text-xs">pandas.groupby</code>)
            </h2>
            <p className="text-xs text-gray-400">
              Domains most frequently linked to fraudulent campaigns
            </p>

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
