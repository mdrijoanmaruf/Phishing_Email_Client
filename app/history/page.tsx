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
  PlusCircle,
  Edit3,
  ShieldBan,
  Calendar,
  User,
  Layers,
  Globe,
  FileText,
  X,
  Database,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory, HistoryLogItem } from '@/lib/api';
import { showSuccessToast, showErrorAlert, showConfirmDelete } from '@/lib/alerts';

export default function HistoryPage() {
  const [logs, setLogs] = useState<HistoryLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedLog, setSelectedLog] = useState<HistoryLogItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory(actionFilter === 'ALL' ? undefined : actionFilter, undefined, 300);
      setLogs(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load activity history';
      showErrorAlert('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [actionFilter]);

  const handleDeleteItem = async (id: string) => {
    const confirmed = await showConfirmDelete(
      'Delete Activity Record?',
      'This action log will be permanently deleted from the history JSON file.'
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteHistoryItem(id);
      showSuccessToast('Activity record deleted');
      setLogs((prev) => prev.filter((item) => item.id !== id));
      if (selectedLog?.id === id) {
        setSelectedLog(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete record';
      showErrorAlert('Delete Failed', msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (logs.length === 0) return;
    const confirmed = await showConfirmDelete(
      'Clear All Activity History?',
      `Are you sure you want to delete all ${logs.length} activity audit logs? This action will reset data/history.json.`
    );
    if (!confirmed) return;

    setClearing(true);
    try {
      await clearAllHistory();
      showSuccessToast('All activity history cleared successfully');
      setLogs([]);
      setSelectedLog(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to clear history';
      showErrorAlert('Clear Failed', msg);
    } finally {
      setClearing(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(
      (item) =>
        item.summary.toLowerCase().includes(q) ||
        item.action.toLowerCase().includes(q) ||
        item.entity_type.toLowerCase().includes(q) ||
        String(item.entity_id).toLowerCase().includes(q) ||
        item.actor.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('ADD') || act.includes('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          ADD
        </span>
      );
    }
    if (act.includes('EDIT') || act.includes('UPDATE')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          EDIT
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          DELETE
        </span>
      );
    }
    if (act.includes('VIEW')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          VIEW
        </span>
      );
    }
    if (act.includes('BLACKLIST')) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <ShieldBan className="w-3.5 h-3.5 text-amber-600" />
          BLACKLIST
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
        {action}
      </span>
    );
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <DashboardLayout pageTitle="Activity & Audit History">
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
                  <h1 className="text-xl font-bold text-gray-900">Activity History &amp; Audit Trail</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {logs.length} Operations Logged
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chronological audit records of all Add, Edit, Delete, View, and Blacklist actions persisted to history.json
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

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All History
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar: Filter Pills & Search */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 self-start md:self-center overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'All Operations' },
              { id: 'ADD', label: 'Add' },
              { id: 'EDIT', label: 'Edit' },
              { id: 'DELETE', label: 'Delete' },
              { id: 'VIEW', label: 'View' },
              { id: 'BLACKLIST', label: 'Blacklist' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActionFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  actionFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history by summary, entity ID, actor..."
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
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Target Entity</th>
                  <th className="py-3 px-6">Summary / Details</th>
                  <th className="py-3 px-6">Actor</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading activity history...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <HistoryIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-800">No Activity Logs Found</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
                        {searchQuery
                          ? 'No activity records matched your filter.'
                          : 'No operations have been recorded yet. Adding, editing, deleting, or viewing emails will generate audit entries automatically.'}
                      </p>
                      <Link
                        href="/dataset"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                      >
                        <Database className="w-3.5 h-3.5" />
                        Go to Dataset Explorer
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{formatTimestamp(item.timestamp)}</span>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {getActionBadge(item.action)}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {item.entity_type === 'BLACKLIST' ? (
                            <Globe className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          )}
                          <span className="text-xs font-semibold font-mono text-gray-800">
                            {item.entity_type} #{item.entity_id}
                          </span>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3.5 px-6">
                        <div className="max-w-[320px]">
                          <p className="text-xs text-gray-800 font-medium truncate" title={item.summary}>
                            {item.summary}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">Log ID: {item.id}</p>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.actor || 'Administrator'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(item)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Inspect Activity Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete History Entry"
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
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-xl max-w-2xl w-full border border-gray-100 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <HistoryIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Activity Audit Record</h3>
                    <p className="text-[11px] text-gray-400 font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Operation Type</span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Timestamp</span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 text-[11px] block">Target Entity</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5">
                    {selectedLog.entity_type} #{selectedLog.entity_id}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-400 text-[11px] block">Actor</span>
                  <span className="font-semibold text-gray-900 truncate block mt-0.5">
                    {selectedLog.actor || 'Administrator'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-semibold text-gray-700 block mb-1">Activity Summary</span>
                <p className="text-xs text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  {selectedLog.summary}
                </p>
              </div>

              {/* Stored JSON Details */}
              {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                    Recorded JSON Payload:
                  </span>
                  <pre className="text-xs text-gray-700 bg-gray-900 text-gray-100 p-3.5 rounded-lg border border-gray-800 font-mono overflow-x-auto max-h-56 custom-scrollbar">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
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
