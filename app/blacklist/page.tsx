import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ShieldBan,
  CheckCircle2,
  Code2,
  ListTodo,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Blacklist' };

export default function BlacklistPage() {
  const apis = [
    { method: 'GET', url: '/api/blacklist', desc: 'List all currently blacklisted domains from blacklist.json' },
    { method: 'POST', url: '/api/blacklist', desc: 'Add new suspicious sender domain to blacklist set' },
    { method: 'DELETE', url: '/api/blacklist/<domain>', desc: 'Remove domain from blacklist set' },
  ];

  const frontendTodos = [
    'Create Domain Input Form with inline "Add Domain" button',
    'Add client-side domain format validation (e.g., rejecting invalid characters or missing TLD)',
    'Build Blacklisted Domains Table with columns: Domain Name, Status Badge ("Active Block"), Actions (Trash icon)',
    'Implement duplicate domain check feedback toast ("Domain is already blacklisted")',
    'Wire row deletion action to DELETE /api/blacklist/<domain> with immediate UI update',
    'Display dynamic total count badge of active blacklisted domains in page header and sidebar',
    'Create empty state illustration when zero domains are blacklisted',
  ];

  const backendTodos = [
    'Initialize BLACKLIST as a Python set loaded from data/blacklist.json on server boot',
    'Implement POST /api/blacklist checking if domain in BLACKLIST before invoking set.add()',
    'Implement DELETE /api/blacklist/<domain> with set.discard() to safely remove entry',
    'Persist set updates back to data/blacklist.json as a serialised JSON list',
    'Connect RuleEngine to automatically award heavy penalty points (+35) if sender domain is in BLACKLIST',
  ];

  return (
    <DashboardLayout pageTitle="Domain Blacklist System">
      <div className="space-y-8 max-w-7xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                <ShieldBan className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Blacklist Management Plan</h1>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                  Phase 3 (Day 11) &amp; Phase 5 (Day 17)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Python Set &bull; O(1) Lookup
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
                        : api.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-700'
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
              <span className="text-xs font-semibold text-gray-400">Blacklist UI</span>
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
              <span className="text-xs font-semibold text-gray-400">Set + JSON Storage</span>
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
            &bull; <span className="font-semibold">Python Set</span>: High-speed O(1) domain lookup during real-time email scanning. Demonstrates set operations (<code className="font-mono">add()</code>, <code className="font-mono">discard()</code>, and membership testing <code className="font-mono">domain in BLACKLIST</code>).<br />
            &bull; <span className="font-semibold">Persistence</span>: Serialising set data into <code className="font-mono">data/blacklist.json</code> ensuring domain blocks persist across server restarts.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
