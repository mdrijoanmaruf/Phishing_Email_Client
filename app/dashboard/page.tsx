import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Database,
  ScanLine,
  BarChart2,
  ShieldBan,
  History,
  Server,
  ArrowRight,
  Code2,
  ListTodo,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  const planModules = [
    {
      title: 'Dataset Management',
      href: '/dataset',
      icon: Database,
      phase: 'Phase 3 (Days 8–11) & Phase 5 (Day 15)',
      status: 'Ready for Implementation',
      apis: ['GET /api/dataset', 'GET /api/dataset/search', 'POST /api/dataset', 'DELETE /api/dataset/<id>'],
      todos: [
        'Connect pandas CSV loader with pagination',
        'Implement search filter by sender, subject, and domain',
        'Build Add Email modal with ID uniqueness set validation',
        'Implement CSV export endpoint integration',
      ],
    },
    {
      title: 'Rule Engine Scanner',
      href: '/scan',
      icon: ScanLine,
      phase: 'Phase 2 (Days 4–7) & Phase 5 (Day 16)',
      status: 'Ready for Implementation',
      apis: ['POST /api/scan', 'GET /api/scan/history'],
      todos: [
        'Form for sender, subject, and email body inputs',
        'Visual score meter (0–100) with color thresholds',
        'Verdict indicator: SAFE (<35), SUSPICIOUS (35–64), PHISHING (≥65)',
        'Detailed reasons breakdown (keywords, URLs, caps ratio, blacklisted domain)',
        'One-click sender domain blacklist action on phishing verdict',
      ],
    },
    {
      title: 'Analytics & Metrics',
      href: '/analytics',
      icon: BarChart2,
      phase: 'Phase 4 (Days 12–13) & Phase 5 (Day 17)',
      status: 'Ready for Implementation',
      apis: ['GET /api/analytics/summary', 'GET /api/analytics/scores', 'GET /api/analytics/top-keywords'],
      todos: [
        'NumPy statistical cards (Mean, Std Dev, 25th & 75th percentiles)',
        'Score distribution histogram bucketed in 10-point ranges',
        'Top suspicious keywords frequency bar chart',
        'Sender domain breakdown table with phishing counts',
      ],
    },
    {
      title: 'Blacklist System',
      href: '/blacklist',
      icon: ShieldBan,
      phase: 'Phase 3 (Day 11) & Phase 5 (Day 17)',
      status: 'Ready for Implementation',
      apis: ['GET /api/blacklist', 'POST /api/blacklist', 'DELETE /api/blacklist/<domain>'],
      todos: [
        'Domain add input with regex format validation',
        'Python set-backed duplicate detection toast',
        'Active blacklisted domains table with remove action',
        'Persistent storage sync with backend blacklist.json',
      ],
    },
    {
      title: 'Scan History',
      href: '/history',
      icon: History,
      phase: 'Phase 3 (Day 11) & Phase 5 (Day 17)',
      status: 'Ready for Implementation',
      apis: ['GET /api/history', 'DELETE /api/history/<id>', 'DELETE /api/history'],
      todos: [
        'Chronological past scan history table',
        'Verdict filter dropdown (All, SAFE, SUSPICIOUS, PHISHING)',
        'Expandable row to inspect detection rule breakdown',
        'Single record deletion & "Clear All History" modal',
      ],
    },
  ];

  return (
    <DashboardLayout pageTitle="Project Dashboard">
      <div className="space-y-8 max-w-7xl">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                <Server className="w-3.5 h-3.5" />
                CSC 4162 Implementation Roadmap
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                PhishGuard Project Plan Overview
              </h1>
              <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                This dashboard tracks the client-server implementation based on{' '}
                <span className="font-semibold text-white">Main_Plan.md</span>. Pure Python OOP,
                Rule Engine, NumPy analytics, pandas dataset operations, and Flask REST APIs.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-semibold text-sm hover:bg-indigo-50 transition-colors shadow-md"
              >
                <ScanLine className="w-4 h-4 text-indigo-700" />
                Test Scanner
              </Link>
              <Link
                href="/dataset"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700/80 border border-indigo-400/30 text-white font-semibold text-sm transition-colors"
              >
                <Database className="w-4 h-4" />
                View Dataset
              </Link>
            </div>
          </div>
        </div>

        {/* Core Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Python Core & OOP</h3>
              <p className="text-gray-500 text-xs mt-1">
                Lists, Sets (ID duplicates, keywords), Tuples (thresholds), Dictionaries, and 5 custom OOP classes.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">NumPy & pandas</h3>
              <p className="text-gray-500 text-xs mt-1">
                pandas DataFrame filtering, CSV loading/exporting, and NumPy statistical score calculations.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-bold">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Flask REST API</h3>
              <p className="text-gray-500 text-xs mt-1">
                15 endpoints across 5 blueprints with CORS enabled serving Next.js client seamlessly.
              </p>
            </div>
          </div>
        </div>

        {/* Modules Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Module-Wise Action Plan & Status</h2>
              <p className="text-xs text-gray-500">
                Detailed requirements and technical tasks for each page defined in Main_Plan.md
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {planModules.map((module) => {
              const { icon: Icon } = module;
              return (
                <div
                  key={module.title}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-900/20">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{module.title}</h3>
                          <span className="text-xs text-indigo-600 font-medium">{module.phase}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Clock className="w-3.5 h-3.5" />
                        {module.status}
                      </span>
                    </div>

                    {/* API Endpoints */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Target Flask APIs
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {module.apis.map((api) => (
                          <span
                            key={api}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700"
                          >
                            {api}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Todo List */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <ListTodo className="w-4 h-4 text-indigo-600" />
                        Implementation Checklist:
                      </p>
                      <ul className="space-y-1.5 pl-1">
                        {module.todos.map((todo, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle2 className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                            <span>{todo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Navigation CTA */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                    <Link
                      href={module.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Open {module.title} Page
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
