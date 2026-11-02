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
  Globe,
  FileText,
  X,
  Database,
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
    if (act.includes('BLACKLIST')) {
      const isRemove = act.includes('REMOVE');
      return (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
          isRemove
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}>
          <ShieldBan className={`w-3.5 h-3.5 ${isRemove ? 'text-rose-600' : 'text-amber-600'}`} />
          {isRemove ? 'BLACKLIST REMOVE' : 'BLACKLIST ADD'}
        </span>
      );
    }
    if (act.includes('ADD') || act.includes('CREATE')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          ADD
        </span>
      );
    }
    if (act.includes('EDIT') || act.includes('UPDATE')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
          EDIT
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 shrink-0">
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          DELETE
        </span>
      );
    }
    if (act.includes('VIEW')) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          VIEW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
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
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* ── 1. Module Header Card ────────────────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
                <HistoryIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    Activity History &amp; Audit Trail
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {logs.length} Operations Logged
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
                  Audit records of all Add, Edit, Delete, View, and Blacklist operations in history.json
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={fetchHistory}
                disabled={loading}
                className="flex-1 sm:flex-none justify-center px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex-1 sm:flex-none justify-center px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Toolbar: Filter Pills & Search ────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Action Filter Pills (Scrollable on small devices) */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1.5 md:pb-0 w-full md:w-auto">
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  actionFilter === f.id
                    ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search summary, entity ID, actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-gray-400 text-gray-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3. History Container (Table + Mobile Cards) ──────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header count bar */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium bg-white">
            <span>
              Showing <span className="font-bold text-gray-900">{filteredLogs.length}</span> of{' '}
              <span className="font-bold text-gray-900">{logs.length}</span> recorded logs
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:underline font-semibold"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* ── A: Mobile Card View (< 768px) ─────────────────────────── */}
          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2.5 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-gray-100 rounded-full w-24" />
                    <div className="h-4 bg-gray-100 rounded w-28" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))
            ) : filteredLogs.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <HistoryIcon className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-800">No Activity Logs Found</p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {searchQuery
                    ? 'No activity records matched your filter criteria.'
                    : 'No operations have been recorded yet.'}
                </p>
                <Link
                  href="/dataset"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Go to Dataset Explorer</span>
                </Link>
              </div>
            ) : (
              filteredLogs.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50/60 transition-colors space-y-2.5"
                >
                  {/* Top Line: Badge & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getActionBadge(item.action)}
                      <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {item.entity_type === 'BLACKLIST' ? (
                          <Globe className="w-3 h-3 text-amber-500" />
                        ) : (
                          <FileText className="w-3 h-3 text-indigo-500" />
                        )}
                        <span>{item.entity_type} #{item.entity_id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs sm:text-sm text-gray-900 font-semibold leading-snug">
                    {item.summary}
                  </p>

                  {/* Footer Meta & Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimestamp(item.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="w-3 h-3" />
                        <span>{item.actor || 'Administrator'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Inspect Activity Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                        title="Delete History Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── B: Desktop Table View (>= 768px) ──────────────────────── */}
          <div className="hidden md:block overflow-x-auto custom-scrollbar">
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
                          : 'No operations have been recorded yet.'}
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
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Activity Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

        {/* ── 4. Detail Inspection Modal ──────────────────────────────── */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setSelectedLog(null)}>
            <div
              className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">Activity Audit Record</h3>
                    <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm overflow-y-auto flex-1 pr-1">
                {/* Action Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Operation Type</span>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Timestamp</span>
                    <p className="text-xs font-semibold text-gray-700">
                      {formatTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 text-[11px] block">Target Entity</span>
                    <span className="font-semibold text-gray-900 truncate block mt-0.5">
                      {selectedLog.entity_type} #{selectedLog.entity_id}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 text-[11px] block">Actor</span>
                    <span className="font-semibold text-gray-900 truncate block mt-0.5">
                      {selectedLog.actor || 'Administrator'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-xs font-semibold text-gray-700 block mb-1">Activity Summary</span>
                  <p className="text-xs text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
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
                    <pre className="text-xs text-gray-100 bg-gray-900 p-3.5 rounded-xl border border-gray-800 font-mono overflow-x-auto max-h-52 custom-scrollbar select-text">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer text-center"
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
