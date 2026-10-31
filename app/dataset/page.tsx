import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Database,
  CheckCircle2,
  Code2,
  ListTodo,
  Download,
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Dataset' };

export default function DatasetPage() {
  const apis = [
    { method: 'GET', url: '/api/dataset', desc: 'Return all email records (or paginated)' },
    { method: 'GET', url: '/api/dataset/search?q=&label=&domain=', desc: 'Filter records with boolean masks' },
    { method: 'POST', url: '/api/dataset', desc: 'Add new email record (duplicate ID rejection)' },
    { method: 'PUT', url: '/api/dataset/<id>', desc: 'Update record fields' },
    { method: 'DELETE', url: '/api/dataset/<id>', desc: 'Delete email record from dataset' },
    { method: 'GET', url: '/api/dataset/export', desc: 'Download filtered records as CSV' },
  ];

  const frontendTodos = [
    'Build paginated Email Records Table with columns: ID, Sender, Subject, Domain, Label, Timestamp, Actions',
    'Create responsive Search Bar for live text queries across sender, subject, and body',
    'Add Label Filter Dropdown: "All Records", "Phishing (1)", "Safe (0)"',
    'Implement "Add Email" modal with field validators (valid email format, non-empty subject/body)',
    'Implement "Edit Email" modal pre-populated with selected row data',
    'Create "Delete Confirmation" modal preventing accidental deletion',
    'Wire "Export CSV" button to trigger file download stream from Flask API',
    'Implement loading skeleton and empty state ("No records found") feedback',
  ];

  const backendTodos = [
    'Implement core/dataset_handler.py: load_csv() converting pandas DataFrame rows into EmailRecord objects',
    'Implement EmailManager class with list storage and Python set for O(1) duplicate ID verification',
    'Build boolean mask query filtering in EmailManager.search() using str.contains and exact label matching',
    'Implement dataset_routes.py Blueprint registering all 6 dataset endpoints',
    'Ensure proper HTTP response codes: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict',
  ];

  return (
    <DashboardLayout pageTitle="Dataset Management">
      <div className="space-y-8 max-w-7xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dataset Management Plan</h1>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                  Phase 3 (Days 8–11) &amp; Phase 5 (Day 15)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                pandas + Python OOP
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {apis.map((api) => (
              <div key={api.url} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      api.method === 'GET'
                        ? 'bg-blue-100 text-blue-700'
                        : api.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-700'
                        : api.method === 'PUT'
                        ? 'bg-amber-100 text-amber-700'
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
              <span className="text-xs font-semibold text-gray-400">Next.js UI</span>
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
              <span className="text-xs font-semibold text-gray-400">Flask + pandas</span>
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
            &bull; <span className="font-semibold">OOP</span>: Encapsulation inside <code className="font-mono">EmailRecord</code> (with <code className="font-mono">get_domain()</code>, <code className="font-mono">to_dict()</code>, <code className="font-mono">from_dict()</code>) and <code className="font-mono">EmailManager</code>.<br />
            &bull; <span className="font-semibold">Data Structures</span>: List of records <code className="font-mono">_records: list[EmailRecord]</code> and Set of IDs <code className="font-mono">_ids: set</code> for instantaneous duplicate detection.<br />
            &bull; <span className="font-semibold">pandas</span>: <code className="font-mono">pd.read_csv()</code> with <code className="font-mono">on_bad_lines=&quot;skip&quot;</code>, DataFrame boolean indexing for multi-field search, and <code className="font-mono">to_csv()</code> export.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
