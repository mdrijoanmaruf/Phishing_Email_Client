import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BarChart2,
  CheckCircle2,
  Code2,
  ListTodo,
  TrendingUp,
  Hash,
  Activity,
  Globe,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  const apis = [
    { method: 'GET', url: '/api/analytics/summary', desc: 'Dataset label counts (0/1), URL percentage, top domains' },
    { method: 'GET', url: '/api/analytics/scores', desc: 'NumPy score statistics: mean, std, min, max, p25, p75' },
    { method: 'GET', url: '/api/analytics/top-keywords', desc: 'Top N suspicious keywords found across scan history' },
    { method: 'GET', url: '/api/analytics/domain-breakdown', desc: 'Phishing email frequency grouped by sender domain' },
  ];

  const frontendTodos = [
    'Build Statistics Metric Cards for NumPy calculations: Mean Score, Std Deviation, 25th Percentile, 75th Percentile',
    'Create Score Distribution Histogram chart bucketed into 10-score intervals (0-9, 10-19, ..., 90-100)',
    'Build Top Suspicious Keywords horizontal bar chart visualizing frequency counts',
    'Create Domain Breakdown Table: Domain name, Phishing Count, and Percentage Share',
    'Add Label Distribution Summary progress widget (Safe % vs Phishing %)',
    'Add "Refresh Analytics" button to re-fetch all statistics concurrently',
    'Implement empty state placeholder when no scans exist in history',
  ];

  const backendTodos = [
    'Implement core/analytics.py: score_stats() utilizing NumPy array operations (np.mean, np.std, np.percentile)',
    'Build label_distribution() and url_percentage() utilizing pandas Series.value_counts() and mean()',
    'Implement top_sender_domains() using pandas DataFrame.groupby("domain") with sort_values(ascending=False)',
    'Implement top_keywords() using Python collections/dictionary counters returning sorted list of (word, count) tuples',
    'Wire analytics_routes.py Blueprint handling all 4 analytical endpoints with error handling for empty states',
  ];

  return (
    <DashboardLayout pageTitle="Analytics & Dataset Statistics">
      <div className="space-y-8 max-w-7xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics &amp; Metrics Plan</h1>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                  Phase 4 (Days 12–13) &amp; Phase 5 (Day 17)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                NumPy + pandas Aggregations
              </span>
            </div>
          </div>
        </div>

        {/* Expected Numerical Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Mean Score', formula: 'np.mean(scores)' },
            { label: 'Std Dev', formula: 'np.std(scores)' },
            { label: '25th Percentile', formula: 'np.percentile(25)' },
            { label: '75th Percentile', formula: 'np.percentile(75)' },
            { label: 'Label Split', formula: 'df["label"].value_counts()' },
            { label: 'URL Presence %', formula: 'df["urls"].apply(len) > 0' },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-900">{item.label}</p>
              <code className="text-[10px] text-indigo-600 font-mono block mt-1">{item.formula}</code>
            </div>
          ))}
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            Mapped Flask Endpoints (Main_Plan.md)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apis.map((api) => (
              <div key={api.url} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    {api.method}
                  </span>
                  <span className="font-mono text-xs font-semibold text-gray-800">{api.url}</span>
                </div>
                <p className="text-[11px] text-gray-500">{api.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Todo Checklists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Frontend Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                Frontend Implementation Tasks
              </h3>
              <span className="text-xs font-semibold text-gray-400">Charts &amp; Visuals</span>
            </div>
            <ul className="space-y-3">
              {frontendTodos.map((todo, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  <span>{todo}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Backend Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                Backend &amp; Logic Implementation Tasks
              </h3>
              <span className="text-xs font-semibold text-gray-400">NumPy + pandas</span>
            </div>
            <ul className="space-y-3">
              {backendTodos.map((todo, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-gray-600 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  <span>{todo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Python Requirements Verification */}
        <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-5">
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
            Academic &amp; Course Requirements Used in this Module
          </h4>
          <p className="text-xs text-indigo-800 leading-relaxed">
            &bull; <span className="font-semibold">NumPy</span>: Array processing for scan score distributions (<code className="font-mono">np.mean</code>, <code className="font-mono">np.std</code>, <code className="font-mono">np.percentile</code>).<br />
            &bull; <span className="font-semibold">pandas</span>: Multi-column aggregation, grouping by sender domain to count phishing instances (<code className="font-mono">groupby()</code>), and label distribution calculation (<code className="font-mono">value_counts()</code>).<br />
            &bull; <span className="font-semibold">Tuples &amp; Dicts</span>: Returning sorted <code className="font-mono">list[tuple[str, int]]</code> representing top keywords and domain rankings.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
