'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  getDataset,
  searchDataset,
  addDatasetRecord,
  updateDatasetRecord,
  deleteDatasetRecord,
  getExportCsvUrl,
  logActivity,
  addToBlacklist,
  EmailRecordItem,
} from '@/lib/api';
import {
  showSuccessToast,
  showErrorAlert,
  showConfirmDelete,
  showConfirmBlacklist,
} from '@/lib/alerts';
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
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  ShieldBan,
} from 'lucide-react';

export default function DatasetPage() {
  const [records, setRecords] = useState<EmailRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [total, setTotal] = useState<number>(71000);
  const [totalPages, setTotalPages] = useState<number>(3550);

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<EmailRecordItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<EmailRecordItem | null>(null);

  // Add form fields
  const [addSender, setAddSender] = useState<string>('');
  const [addSubject, setAddSubject] = useState<string>('');
  const [addBody, setAddBody] = useState<string>('');
  const [addLabel, setAddLabel] = useState<0 | 1>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Unified load / search handler
  const loadData = useCallback(
    async (
      targetPage: number,
      targetPerPage: number,
      q: string,
      lbl: string,
      dom: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const isFiltering = Boolean(q.trim() || (lbl && lbl !== 'all') || dom.trim());

        const response = isFiltering
          ? await searchDataset(q, lbl, dom, targetPage, targetPerPage)
          : await getDataset(targetPage, targetPerPage);

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
    },
    []
  );

  // Fetch when page or perPage changes
  useEffect(() => {
    loadData(page, perPage, searchQuery, labelFilter, domainFilter);
  }, [loadData, page, perPage]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, perPage, searchQuery, labelFilter, domainFilter);
  };

  // Handle Filter Change
  const handleLabelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLabelFilter(val);
    setPage(1);
    loadData(1, perPage, searchQuery, val, domainFilter);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setLabelFilter('all');
    setDomainFilter('');
    setPage(1);
    loadData(1, perPage, '', 'all', '');
  };

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

  // Generate numbered pages with ellipsis for large datasets
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Add Record Action with SweetAlert
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSender.trim() || !addBody.trim()) {
      showErrorAlert('Missing Information', 'Sender and email body are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDatasetRecord({
        sender: addSender.trim(),
        subject: addSubject.trim(),
        body: addBody.trim(),
        label: addLabel,
      });

      setIsAddModalOpen(false);
      setAddSender('');
      setAddSubject('');
      setAddBody('');
      setAddLabel(0);
      setPage(1);
      loadData(1, perPage, searchQuery, labelFilter, domainFilter);
      showSuccessToast('Success!', 'New email record has been added.');
    } catch (err: any) {
      showErrorAlert('Failed to Add', err.message || 'Could not add the email record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Record Action with SweetAlert
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setIsSubmitting(true);
    try {
      await updateDatasetRecord(editingRecord.id, {
        sender: editingRecord.sender,
        subject: editingRecord.subject,
        body: editingRecord.body,
        label: editingRecord.label,
      });

      const updatedId = editingRecord.id;
      setEditingRecord(null);
      loadData(page, perPage, searchQuery, labelFilter, domainFilter);
      showSuccessToast('Updated!', `Record #${updatedId} saved successfully.`);
    } catch (err: any) {
      showErrorAlert('Failed to Update', err.message || 'Could not update the record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Record Action with SweetAlert (Swal.fire confirm dialog)
  const handleDeleteClick = async (record: EmailRecordItem) => {
    const result = await showConfirmDelete(
      'Delete Email Record?',
      `Are you sure you want to delete record #${record.id}? Sender: ${record.sender || 'Unknown'}`
    );

    if (result.isConfirmed) {
      try {
        await deleteDatasetRecord(record.id);
        showSuccessToast('Deleted!', `Record #${record.id} has been removed.`);
        loadData(page, perPage, searchQuery, labelFilter, domainFilter);
      } catch (err: any) {
        showErrorAlert('Delete Failed', err.message || 'Could not delete the record.');
      }
    }
  };

  // Blacklist Domain Action with SweetAlert
  const handleBlacklistClick = async (record: EmailRecordItem) => {
    let domain = record.domain?.trim().toLowerCase();
    if (!domain && record.sender) {
      const match = record.sender.match(/@([\w\.-]+\.[a-zA-Z]{2,})/);
      if (match) {
        domain = match[1].toLowerCase();
      } else if (record.sender.includes('@')) {
        domain = record.sender.split('@')[1].trim().replace(/[>)\s]/g, '').toLowerCase();
      }
    }

    if (!domain) {
      showErrorAlert('Missing Domain', 'No valid domain name could be extracted from this record.');
      return;
    }

    const result = await showConfirmBlacklist(domain);
    if (result.isConfirmed) {
      try {
        const res = await addToBlacklist(domain);
        showSuccessToast('Domain Blacklisted', res.message || `Domain '${domain}' added to blacklist.json`);
      } catch (err: any) {
        showErrorAlert('Blacklist Failed', err.message || 'Could not add domain to blacklist.');
      }
    }
  };

  // CSV Export Trigger
  const handleExportCsv = () => {
    const exportUrl = getExportCsvUrl(searchQuery, labelFilter, domainFilter);
    window.open(exportUrl, '_blank');
    showSuccessToast('Export Started', 'Your CSV download should begin shortly.');
  };

  // View Details with activity logging
  const handleViewRecord = (record: EmailRecordItem) => {
    setSelectedRecord(record);
    logActivity({
      action: 'VIEW',
      entity_type: 'EMAIL',
      entity_id: record.id,
      summary: `Viewed email #${record.id}: ${record.subject || '(No subject)'}`,
      details: {
        id: record.id,
        sender: record.sender,
        subject: record.subject,
        label: record.label,
        domain: record.domain,
      },
      actor: 'Administrator',
    }).catch(() => {});
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
                Live Data &bull; Flask REST API
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {total.toLocaleString()} Records
            </span>

            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm transition-colors cursor-pointer"
              title="Download CSV export"
            >
              <Download className="w-4 h-4 text-gray-600" />
              Export CSV
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-900 text-white text-sm font-medium hover:opacity-95 shadow-md shadow-indigo-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Email
            </button>

            <button
              onClick={() => loadData(page, perPage, searchQuery, labelFilter, domainFilter)}
              disabled={loading}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              title="Refresh dataset"
            >
              <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-800 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-bold">Notice</p>
              <p className="mt-0.5 text-red-700 text-xs">{error}</p>
            </div>
            <button
              onClick={() => loadData(page, perPage, searchQuery, labelFilter, domainFilter)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
            {/* Keyword Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across sender, subject, or email body..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-gray-400 text-gray-800"
              />
            </div>

            {/* Label Filter */}
            <div className="w-full md:w-44">
              <select
                value={labelFilter}
                onChange={handleLabelFilterChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer"
              >
                <option value="all">All Labels (71,000)</option>
                <option value="1">Phishing</option>
                <option value="0">Safe</option>
              </select>
            </div>

            {/* Submit / Clear */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                type="submit"
                className="flex-1 md:flex-none px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold transition-colors border border-indigo-100 cursor-pointer"
              >
                Search
              </button>
              {(searchQuery || labelFilter !== 'all' || domainFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors border border-gray-200 cursor-pointer"
                  title="Reset filters"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

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
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
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
                  <th className="px-4 py-3.5 w-32 text-center">Actions</th>
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
                      <td className="px-4 py-3.5 text-center"><div className="h-7 w-16 bg-gray-100 rounded mx-auto" /></td>
                    </tr>
                  ))
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-400">
                      No records found matching your query.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
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
                            Phishing
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Safe
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 truncate" title={record.date}>
                        {record.date || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewRecord(record)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View Email Details"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => setEditingRecord({ ...record })}
                            className="p-1.5 rounded-md text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => handleBlacklistClick(record)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={record.domain ? `Blacklist Domain (${record.domain})` : 'Blacklist Sender Domain'}
                          >
                            <ShieldBan className="w-4 h-4 text-rose-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(record)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
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

            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Numbered Page Buttons */}
              {getPageNumbers().map((p, idx) =>
                typeof p === 'number' ? (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`min-w-9 h-9 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      p === page
                        ? 'bg-gradient-to-r from-indigo-700 to-indigo-900 text-white shadow-md shadow-indigo-900/30'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-indigo-700'
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-sm font-bold text-gray-400 select-none"
                  >
                    ...
                  </span>
                )
              )}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Modal: Add Email ─────────────────────────────────────────── */}
        {isAddModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg border border-gray-200 max-w-lg w-full p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Add Email Record</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Sender Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. security-alert@paypal.com or Name <user@domain.com>"
                    value={addSender}
                    onChange={(e) => setAddSender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Action Required: Account Notice"
                    value={addSubject}
                    onChange={(e) => setAddSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Email Body *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Paste the email content..."
                    value={addBody}
                    onChange={(e) => setAddBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Label
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                      <input
                        type="radio"
                        name="label"
                        checked={addLabel === 0}
                        onChange={() => setAddLabel(0)}
                        className="accent-indigo-600"
                      />
                      Safe
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                      <input
                        type="radio"
                        name="label"
                        checked={addLabel === 1}
                        onChange={() => setAddLabel(1)}
                        className="accent-red-600"
                      />
                      Phishing
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-md shadow-indigo-900/20 disabled:opacity-50 transition-opacity cursor-pointer"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Edit Email ────────────────────────────────────────── */}
        {editingRecord && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setEditingRecord(null)}
          >
            <div
              className="bg-white rounded-lg border border-gray-200 max-w-lg w-full p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base">Edit Record #{editingRecord.id}</h3>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Sender Email (Text)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRecord.sender}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, sender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editingRecord.subject}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Email Body
                  </label>
                  <textarea
                    rows={4}
                    value={editingRecord.body}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, body: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                    Label
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                      <input
                        type="radio"
                        name="editLabel"
                        checked={editingRecord.label === 0}
                        onChange={() => setEditingRecord({ ...editingRecord, label: 0 })}
                        className="accent-indigo-600"
                      />
                      Safe
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                      <input
                        type="radio"
                        name="editLabel"
                        checked={editingRecord.label === 1}
                        onChange={() => setEditingRecord({ ...editingRecord, label: 1 })}
                        className="accent-red-600"
                      />
                      Phishing
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-xs font-semibold hover:opacity-95 shadow-md shadow-indigo-900/20 disabled:opacity-50 transition-opacity cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Detail View ───────────────────────────────────────── */}
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
                      Phishing
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Safe
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-indigo-700 font-medium text-xs">{selectedRecord.domain || '—'}</span>
                    <button
                      type="button"
                      onClick={() => handleBlacklistClick(selectedRecord)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded border border-rose-200 transition-colors cursor-pointer"
                      title="Add domain to blacklist.json"
                    >
                      <ShieldBan className="w-3 h-3" />
                      Blacklist Domain
                    </button>
                  </div>
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
                  className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-sm font-medium hover:opacity-95 shadow-md shadow-indigo-900/20 transition-opacity cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
