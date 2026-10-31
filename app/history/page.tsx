'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import {
  History as HistoryIcon,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  X,
  FileText,
  Calendar,
  Globe,
  Tag,
  Link as LinkIcon,
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory, ScanResult } from '@/lib/api';
import { showSuccessToast, showErrorAlert, showConfirmDelete } from '@/lib/alerts';

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<string>('ALL');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory(verdictFilter === 'ALL' ? undefined : verdictFilter, 200);
      setScans(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load history';
      showErrorAlert('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [verdictFilter]);

  const handleDeleteItem = async (id: string) => {
    const confirmed = await showConfirmDelete(
      'Delete Scan Record?',
      'This scan entry will be permanently removed from audit history.'
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      showSuccessToast('Scan record deleted');
      setScans((prev) => prev.filter((s) => s.id !== id));
      if (selectedScan?.id === id) {
        setSelectedScan(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record';
      showErrorAlert('Delete Failed', msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (scans.length === 0) return;
    const confirmed = await showConfirmDelete(
      'Clear Entire Scan History?',
      `Are you sure you want to delete all ${scans.length} historical scan records? This action cannot be undone.`
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      await clearAllHistory();
      showSuccessToast('All scan history cleared successfully');
      setScans([]);
      setSelectedScan(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clear history';
      showErrorAlert('Clear Failed', msg);
    } finally {
      setClearing(false);
    }
  };

  const filteredScans = useMemo(() => {
    if (!searchQuery.trim()) return scans;
    const q = searchQuery.toLowerCase().trim();
    return scans.filter(
      (s) =>
        s.sender.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.domain.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [scans, searchQuery]);

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            SAFE
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            SUSPICIOUS
          </span>
        );
      case 'PHISHING':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            PHISHING
          </span>
        );
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <DashboardLayout pageTitle="Scan History & Logs">
      <div className="space-y-6 max-w-7xl">
        {/* Module Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">Email Scan History</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {scans.length} Scans Logged
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Audit trail and historical logs of all scanned emails and rule trigger explanations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {scans.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Verdict Filter Pills */}
          <div className="flex items-center gap-1.5 self-start md:self-center overflow-x-auto w-full md:w-auto">
            {['ALL', 'PHISHING', 'SUSPICIOUS', 'SAFE'].map((verdict) => (
              <button
                key={verdict}
                type="button"
                onClick={() => setVerdictFilter(verdict)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
                  verdictFilter === verdict
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {verdict.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sender, subject, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* History Table Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Sender &amp; Domain</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Score</th>
                  <th className="py-3 px-6">Verdict</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading history records...
                    </td>
                  </tr>
                ) : filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <HistoryIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-800">No Scan Records Found</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                        {searchQuery
                          ? 'No history entries matched your search query.'
                          : 'No historical scan audits recorded yet.'}
                      </p>
                      <Link
                        href="/dataset"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Explore Dataset
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatTimestamp(scan.timestamp)}</span>
                        </div>
                      </td>

                      {/* Sender */}
                      <td className="py-3.5 px-6">
                        <div className="max-w-[200px]">
                          <p className="text-xs font-semibold text-gray-900 truncate" title={scan.sender}>
                            {scan.sender || 'Unknown Sender'}
                          </p>
                          {scan.domain && (
                            <p className="text-[11px] text-gray-400 font-mono truncate">{scan.domain}</p>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-6">
                        <div className="max-w-[240px]">
                          <p className="text-xs text-gray-700 truncate font-medium" title={scan.subject}>
                            {scan.subject || '(No subject)'}
                          </p>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 w-8">{scan.score}</span>
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                scan.score >= 65
                                  ? 'bg-red-500'
                                  : scan.score >= 35
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.max(8, scan.score)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Verdict */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {getVerdictBadge(scan.verdict)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedScan(scan)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(scan.id)}
                            disabled={deletingId === scan.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Inspection Modal */}
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-100 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Scan Details &amp; Audit</h3>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {selectedScan.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score & Verdict Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Classification</span>
                  <div className="mt-1">{getVerdictBadge(selectedScan.verdict)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Risk Score</span>
                  <p className="text-2xl font-black text-gray-900">
                    {selectedScan.score}
                    <span className="text-xs font-bold text-gray-400">/100</span>
                  </p>
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 text-[11px] block">Sender Address</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5">
                    {selectedScan.sender || 'N/A'}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 text-[11px] block">Extracted Domain</span>
                  <span className="font-mono font-semibold text-gray-900 truncate block mt-0.5">
                    {selectedScan.domain || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1">Subject Line</span>
                <p className="text-xs text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {selectedScan.subject || '(Empty Subject)'}
                </p>
              </div>

              {/* Explanations */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Rule Trigger Explanations ({selectedScan.reasons.length})
                </span>
                <ul className="space-y-1.5">
                  {selectedScan.reasons.map((r, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-start gap-2"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Triggered Keywords */}
              {selectedScan.keywords_found && selectedScan.keywords_found.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Keywords Detected ({selectedScan.keywords_found.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedScan.keywords_found.map((kw, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* URLs */}
              {selectedScan.urls && selectedScan.urls.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                    URLs Extracted ({selectedScan.urls.length}):
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                    {selectedScan.urls.map((u, i) => (
                      <p
                        key={i}
                        className="text-[11px] font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded truncate border border-gray-100"
                      >
                        {u}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Body Snippet */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1">Email Body</span>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">
                  {selectedScan.body || '(Empty Body)'}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
