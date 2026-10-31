import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  History,
  CheckCircle2,
  Code2,
  ListTodo,
  Trash2,
  Filter,
  Eye,
  Calendar,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Scan History' };

export default function HistoryPage() {
  const apis = [
    { method: 'GET', url: '/api/history', desc: 'Retrieve full list of past scan results from history.json' },
    { method: 'DELETE', url: '/api/history/<id>', desc: 'Remove single scan entry by ID' },
    { method: 'DELETE', url: '/api/history', desc: 'Clear all past scan records permanently' },
  ];

  const frontendTodos = [
    'Build Paginated Scan History Table with columns: Scan ID, Sender, Subject snippet, Score, Verdict Badge, Timestamp, Actions',
    'Add Verdict Filter Dropdown: "All Verdicts", "SAFE", "SUSPICIOUS", "PHISHING"',
    'Build Expandable Row mechanism to inspect the complete detection reasons list for any historic scan',
    'Add Single Row Delete action with trash icon and confirmation toast',
    'Create "Clear All History" button with modal confirmation dialog',
    'Build empty state ("No scans recorded yet") with direct CTA link to /scan',
  ];

  const backendTodos = [
    'Implement history_routes.py Blueprint registering all 3 history management endpoints',
    'Persist scan results to data/history.json using json.dump / json.load with proper file creation if absent',
    'Implement DELETE /api/history/<id> using list comprehension filtering matching scan ID',
    'Implement DELETE /api/history resetting history.json to empty list []',
    'Handle potential JSON corruption gracefully with automatic fallback initialization',
  ];

  return (
    <DashboardLayout pageTitle="Scan History & Logs">
      <div className="space-y-8 max-w-7xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Scan History Implementation Plan</h1>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                  Phase 3 (Day 11) &amp; Phase 5 (Day 17)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                JSON Persistence &bull; History Auditing
              </span>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-600" />
            Mapped Flask Endpoints (Main_Plan.md)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {apis.map((api) => (
              <div key={api.url} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      api.method === 'GET'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
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
              <span className="text-xs font-semibold text-gray-400">History UI</span>
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
              <span className="text-xs font-semibold text-gray-400">JSON Storage</span>
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
            &bull; <span className="font-semibold">OOP</span>: Encapsulating audit records using <code className="font-mono">ScanResult</code> (with <code className="font-mono">to_dict()</code> / <code className="font-mono">from_dict()</code>).<br />
            &bull; <span className="font-semibold">Data Structures</span>: List of scan records with list comprehension deletion and timestamp ordering.<br />
            &bull; <span className="font-semibold">Persistence</span>: Persisting scan history to <code className="font-mono">data/history.json</code>, resilient to server restarts and missing file edge cases.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
