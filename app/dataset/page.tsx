'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getDataset, EmailRecordItem } from '@/lib/api';
import {
  Database,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export default function DatasetPage() {
  const [records, setRecords] = useState<EmailRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [selectedRecord, setSelectedRecord] = useState<EmailRecordItem | null>(null);

  const loadData = useCallback(async (targetPage: number, targetPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDataset(targetPage, targetPerPage);
      if (response.success) {
        setRecords(response.data || []);
        setTotal(response.total || 0);
        setPage(response.page || targetPage);
        setPerPage(response.per_page || targetPerPage);
        setTotalPages(response.total_pages || 1);
      } else {
        setError(response.error || 'Failed to fetch dataset');
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Could not connect to Flask API server at http://localhost:5000. Ensure python app.py is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, perPage);
  }, [loadData, page, perPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    setPage(1);
  };

  return (
    <DashboardLayout pageTitle="Dataset Management">
      <div className="space-y-6 max-w-7xl">
        {/* Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-900/30">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Email Records Dataset</h1>
              <p className="text-[11px] text-indigo-600 uppercase tracking-wider font-semibold">
                Live Data &bull; GET /api/dataset
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {total.toLocaleString()} Records
            </span>
            <button
              onClick={() => loadData(page, perPage)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
              title="Refresh dataset"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold">Error loading dataset</p>
              <p className="mt-0.5 text-red-700 text-xs">{error}</p>
            </div>
            <button
              onClick={() => loadData(page, perPage)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dataset Table Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
            <div className="text-sm text-gray-700 font-medium">
              Showing{' '}
              <span className="font-bold text-gray-900">
                {total === 0 ? 0 : (page - 1) * perPage + 1}
              </span>{' '}
              to{' '}
              <span className="font-bold text-gray-900">
                {Math.min(page * perPage, total)}
              </span>{' '}
              of <span className="font-bold text-gray-900">{total.toLocaleString()}</span> entries
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="perPageSelect" className="text-sm font-medium text-gray-600">
                Rows per page:
              </label>
              <select
                id="perPageSelect"
                value={perPage}
                onChange={handlePerPageChange}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Table with Custom Thick Scrollbar & Compact Proportions */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse table-fixed min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-xs tracking-wider">
                  <th className="px-4 py-3.5 w-16 text-center">ID</th>
                  <th className="px-4 py-3.5 w-48">Sender</th>
                  <th className="px-4 py-3.5 w-60">Subject</th>
                  <th className="px-4 py-3.5 w-36">Domain</th>
                  <th className="px-4 py-3.5 w-28">Label</th>
                  <th className="px-4 py-3.5 w-36">Date</th>
                  <th className="px-4 py-3.5 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3.5 text-center"><div className="h-4 bg-gray-100 rounded w-8 mx-auto" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-40" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-52" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                      <td className="px-4 py-3.5"><div className="h-5 bg-gray-100 rounded-full w-20" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-28" /></td>
                      <td className="px-4 py-3.5 text-center"><div className="h-7 w-7 bg-gray-100 rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">
                      No records found in dataset.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td className="px-4 py-3.5 font-mono font-medium text-gray-500 text-center text-xs">
                        {record.id}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 truncate" title={record.sender}>
                        {record.sender || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-800 truncate" title={record.subject}>
                        {record.subject || '(No Subject)'}
                      </td>
                      <td className="px-4 py-3.5 truncate">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {record.domain || 'unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {record.label === 1 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            Phishing (1)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Safe (0)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 truncate" title={record.date}>
                        {record.date || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <span className="text-sm text-gray-600 font-medium">
              Page <span className="font-bold text-gray-900">{page}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages.toLocaleString()}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Detail Modal for Selected Email */}
        {selectedRecord && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <div
              className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-500">
                    Record #{selectedRecord.id}
                  </span>
                  {selectedRecord.label === 1 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                      Phishing (1)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Safe (0)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm overflow-y-auto flex-1 pr-1">
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block">Sender</span>
                  <span className="text-gray-900 font-medium">{selectedRecord.sender || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block">Receiver</span>
                  <span className="text-gray-800">{selectedRecord.receiver || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block">Domain</span>
                  <span className="font-mono text-indigo-700 font-medium text-xs">{selectedRecord.domain}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block">Date</span>
                  <span className="text-gray-700 text-xs">{selectedRecord.date || '—'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block">Subject</span>
                  <span className="text-gray-900 font-semibold">{selectedRecord.subject || '(No Subject)'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs block mb-1">Body Preview</span>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                    {selectedRecord.body || '(Empty Body)'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-sm font-medium hover:opacity-95 shadow-md shadow-indigo-900/20 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Implementation Checklist (Bottom) ─────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <p className="mb-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Dataset Module Tasks (Implementation Checklist)
          </p>

          <ul className="space-y-2 text-xs text-gray-700">
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="line-through text-gray-400">
                [Completed] Backend: Implement core/dataset_service.py converting pandas DataFrame rows into EmailRecord objects
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="line-through text-gray-400">
                [Completed] Backend: Build EmailRecord OOP class with get_domain(), to_dict(), from_dict()
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="line-through text-gray-400">
                [Completed] Backend: Implement GET /api/dataset with pagination (page, per_page)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="line-through text-gray-400">
                [Completed] Frontend: Connect Next.js to Flask API (http://localhost:5000/api/dataset) with loading &amp; error states
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="line-through text-gray-400">
                [Completed] Frontend: Build paginated Email Records Table with columns (ID, Sender, Subject, Domain, Label, Date, Details modal)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Create responsive Search Bar for live text queries across sender, subject, and body (GET /api/dataset/search)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Add Label Filter Dropdown: &quot;All Records&quot;, &quot;Phishing (1)&quot;, &quot;Safe (0)&quot;
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Implement &quot;Add Email&quot; modal with field validators (POST /api/dataset)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Implement &quot;Edit Email&quot; modal pre-populated with selected row data (PUT /api/dataset/&lt;id&gt;)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Create &quot;Delete Confirmation&quot; modal preventing accidental deletion (DELETE /api/dataset/&lt;id&gt;)
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <input
                type="checkbox"
                disabled
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-not-allowed"
              />
              <span className="text-gray-700 font-medium">
                [Pending] Wire &quot;Export CSV&quot; button to trigger file download stream from Flask API (GET /api/dataset/export)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
