import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ScanLine,
  CheckCircle2,
  Code2,
  ListTodo,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Scan Email' };

export default function ScanPage() {
  const apis = [
    { method: 'POST', url: '/api/scan', desc: 'Analyse email payload (sender, subject, body) and return verdict' },
    { method: 'GET', url: '/api/scan/history', desc: 'Fetch past scan results for comparison' },
    { method: 'POST', url: '/api/blacklist', desc: 'Optional: Immediately blacklist phishing sender domain' },
  ];

  const frontendTodos = [
    'Create Scan Input Form with fields: Sender Email, Subject Line, and Email Body (large textarea)',
    'Implement client-side form validation (non-empty body, valid email pattern)',
    'Build animated 0–100 Score Progress Bar with dynamic color spectrum (Green -> Amber -> Red)',
    'Create high-contrast Verdict Badge: SAFE (0–34), SUSPICIOUS (35–64), PHISHING (65–100)',
    'Build Reasons Breakdown List explaining each rule trigger (Keywords found, IP URLs, Caps Ratio, Domain check)',
    'Provide one-click "Blacklist Sender Domain" button when verdict is PHISHING',
    'Add "Clear Form" and "Scan Another" reset controls',
    'Show toast feedback confirming result was saved to scan history',
  ];

  const backendTodos = [
    'Implement core/rule_engine.py: RuleEngine.score() calculating weighted points from 0 to 100',
    'Implement RuleEngine.explain() returning exact list of explanation reason strings',
    'Build detection rules: Keyword match (set intersection), URL presence, IP-based links, Caps ratio, "!" count',
    'Implement core/detector.py: PhishingDetector with THRESHOLDS tuple = (35, 65)',
    'Wire scan_routes.py Blueprint handling POST /api/scan and saving ScanResult to history.json',
  ];

  return (
    <DashboardLayout pageTitle="Rule Engine Scanner">
      <div className="space-y-8 max-w-7xl">
        {/* Module Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Email Scanner Implementation Plan</h1>
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
                  Phase 2 (Days 4–7) &amp; Phase 5 (Day 16)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Rule-Based Detection (No ML)
              </span>
            </div>
          </div>
        </div>

        {/* Threshold Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">SAFE VERDICT</p>
              <p className="text-xs text-emerald-700">Score Range: 0 to 34 (Threshold tuple lower bound)</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">SUSPICIOUS VERDICT</p>
              <p className="text-xs text-amber-700">Score Range: 35 to 64 (Requires analyst attention)</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-900 uppercase tracking-wide">PHISHING VERDICT</p>
              <p className="text-xs text-red-700">Score Range: 65 to 100 (Threshold tuple upper bound)</p>
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
                        : 'bg-emerald-100 text-emerald-700'
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
              <span className="text-xs font-semibold text-gray-400">Scanner UI</span>
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
              <span className="text-xs font-semibold text-gray-400">Python RuleEngine</span>
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
            &bull; <span className="font-semibold">Sets</span>: <code className="font-mono">KEYWORDS: set</code> for suspicious token matching and <code className="font-mono">BLACKLIST: set</code> for domain inspection.<br />
            &bull; <span className="font-semibold">Tuples</span>: <code className="font-mono">THRESHOLDS: tuple = (35, 65)</code> maintaining immutable classification boundaries.<br />
            &bull; <span className="font-semibold">OOP</span>: Separation of concerns between <code className="font-mono">RuleEngine</code> (calculates metrics &amp; reasons) and <code className="font-mono">PhishingDetector</code> (evaluates verdict and encapsulates <code className="font-mono">ScanResult</code>).
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
