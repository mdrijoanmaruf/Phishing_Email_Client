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
  Mail,
  Calendar,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function DatasetPage() {
  const [records, setRecords] = useState<EmailRecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(20);
  const [total, setTotal] = useState<number>(71000);
  const [totalPages, setTotalPages] = useState<number>(3550);

  const [selectedRecord, setSelectedRecord] = useState<EmailRecordItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<EmailRecordItem | null>(null);

  const [addSender, setAddSender] = useState<string>('');
  const [addSubject, setAddSubject] = useState<string>('');
  const [addBody, setAddBody] = useState<string>('');
  const [addLabel, setAddLabel] = useState<0 | 1>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            'Could not connect to Flask API server. Ensure the backend is running.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData(page, perPage, searchQuery, labelFilter, domainFilter);
  }, [loadData, page, perPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, perPage, searchQuery, labelFilter, domainFilter);
  };

  const handleLabelFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setLabelFilter(val);
    setPage(1);
    loadData(1, perPage, searchQuery, val, domainFilter);
  };

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

  const handleExportCsv = () => {
    const exportUrl = getExportCsvUrl(searchQuery, labelFilter, domainFilter);
    window.open(exportUrl, '_blank');
    showSuccessToast('Export Started', 'Your CSV download should begin shortly.');
  };

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

  const isFiltering = Boolean(searchQuery.trim() || labelFilter !== 'all' || domainFilter.trim());

  return (
    <DashboardLayout pageTitle="Dataset Management">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
                <Database className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight truncate">
                    Dataset Explorer
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live REST API
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 truncate mt-0.5">
                  Browse, search, edit, and filter 71,000 email records across phishing and safe categories
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-bold px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                {total.toLocaleString()} Records
              </span>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-xs cursor-pointer"
                title="Download CSV export"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span className="hidden xs:inline">Export</span> CSV
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-900 text-white text-xs sm:text-sm font-semibold hover:from-indigo-800 hover:to-indigo-950 active:scale-95 shadow-sm shadow-indigo-900/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Email</span>
              </button>

              <button
                type="button"
                onClick={() => loadData(page, perPage, searchQuery, labelFilter, domainFilter)}
                disabled={loading}
                className="p-2 sm:p-2.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
                title="Refresh dataset"
                aria-label="Refresh dataset"
              >
                <RefreshCw className={`w-4 h-4 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 sm:p-4 flex items-start gap-3 text-red-800 shadow-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 text-xs sm:text-sm">
              <p className="font-bold">Dataset Connection Error</p>
              <p className="mt-0.5 text-red-700 break-words">{error}</p>
            </div>
            <button
              onClick={() => loadData(page, perPage, searchQuery, labelFilter, domainFilter)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search sender, subject, or email text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder-gray-400 text-gray-800 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full md:w-48 shrink-0">
              <select
                value={labelFilter}
                onChange={handleLabelFilterChange}
                className="w-full px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 font-medium cursor-pointer transition-all"
              >
                <option value="all">All Labels (71,000)</option>
                <option value="1">Phishing (1)</option>
                <option value="0">Safe (0)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="flex-1 md:flex-none px-4 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white hover:from-indigo-800 hover:to-indigo-950 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold active:scale-95 shadow-xs transition-all cursor-pointer text-center"
              >
                Search
              </button>
              {isFiltering && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium active:scale-95 transition-all cursor-pointer"
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {isFiltering && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1 font-medium">
                  Query: &quot;{searchQuery}&quot;
                  <button type="button" onClick={() => { setSearchQuery(''); loadData(1, perPage, '', labelFilter, domainFilter); }}>
                    <X className="w-3 h-3 text-indigo-400 hover:text-indigo-700" />
                  </button>
                </span>
              )}
              {labelFilter !== 'all' && (
                <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-medium ${
                  labelFilter === '1'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Label: {labelFilter === '1' ? 'Phishing' : 'Safe'}
                  <button type="button" onClick={() => { setLabelFilter('all'); loadData(1, perPage, searchQuery, 'all', domainFilter); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-3.5 sm:px-6 py-3 sm:py-3.5 border-b border-gray-100 flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 bg-white">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
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

            <div className="flex items-center gap-2 self-start xs:self-auto">
              <label htmlFor="perPageSelect" className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                Rows per page:
              </label>
              <select
                id="perPageSelect"
                value={perPage}
                onChange={handlePerPageChange}
                className="px-2.5 py-1 sm:py-1.5 rounded-lg border border-gray-200 bg-white text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-100 rounded w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gray-100 rounded flex-1" />
                    <div className="h-8 bg-gray-100 rounded flex-1" />
                    <div className="h-8 bg-gray-100 rounded flex-1" />
                  </div>
                </div>
              ))
            ) : records.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-sm font-medium">No records found</p>
                <p className="text-xs text-gray-400">Try adjusting your search query or label filters</p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="p-4 hover:bg-indigo-50/20 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        #{record.id}
                      </span>
                      {record.label === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          Phishing
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Safe
                        </span>
                      )}
                    </div>
                    {record.date && (
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 shrink-0 font-medium">
                        <Calendar className="w-3 h-3" />
                        {record.date}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                    {record.subject || '(No Subject)'}
                  </h3>

                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate font-medium">{record.sender || 'Unknown Sender'}</span>
                    </div>
                    {record.domain && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 truncate">
                          {record.domain}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleViewRecord(record)}
                      className="py-1.5 px-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRecord({ ...record })}
                      className="py-1.5 px-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Edit Record"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBlacklistClick(record)}
                      className="py-1.5 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Blacklist Domain"
                    >
                      <ShieldBan className="w-3.5 h-3.5" />
                      <span>Block</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(record)}
                      className="py-1.5 px-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse table-fixed min-w-[860px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="px-4 py-3.5 w-16 text-center">ID</th>
                  <th className="px-4 py-3.5 w-48">Sender</th>
                  <th className="px-4 py-3.5 w-60">Subject</th>
                  <th className="px-4 py-3.5 w-36">Domain</th>
                  <th className="px-4 py-3.5 w-28 text-center">Label</th>
                  <th className="px-4 py-3.5 w-32">Date</th>
                  <th className="px-4 py-3.5 w-36 text-center">Actions</th>
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
                      <td className="px-4 py-3.5 text-center"><div className="h-5 bg-gray-100 rounded-full w-20 mx-auto" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-gray-100 rounded w-24" /></td>
                      <td className="px-4 py-3.5 text-center"><div className="h-7 w-20 bg-gray-100 rounded mx-auto" /></td>
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
                      <td className="px-4 py-3.5 font-mono font-semibold text-gray-500 text-center text-xs">
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
                      <td className="px-4 py-3.5 text-center">
                        {record.label === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Phishing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Safe
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500 truncate" title={record.date}>
                        {record.date || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleViewRecord(record)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View Email Details"
                          >
                            <Eye className="w-4 h-4 text-indigo-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRecord({ ...record })}
                            className="p-1.5 rounded-md text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBlacklistClick(record)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={record.domain ? `Blacklist Domain (${record.domain})` : 'Blacklist Sender Domain'}
                          >
                            <ShieldBan className="w-4 h-4 text-rose-500" />
                          </button>
                          <button
                            type="button"
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

          <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <span className="text-xs sm:text-sm text-gray-600 font-medium order-2 sm:order-1 text-center sm:text-left">
              Page <span className="font-bold text-gray-900">{page}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages.toLocaleString()}</span>
            </span>

            <div className="flex sm:hidden items-center gap-1.5 order-1 sm:order-2 w-full justify-between xs:w-auto xs:justify-center">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center order-2">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || loading}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {getPageNumbers().map((p, idx) =>
                typeof p === 'number' ? (
                  <button
                    type="button"
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
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
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

        {isAddModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-fade-in"
            onClick={() => setIsAddModalOpen(false)}
          >
            <div
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 max-w-lg w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Add Email Record</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-sm overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Sender Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. security-alert@paypal.com or Name <user@domain.com>"
                    value={addSender}
                    onChange={(e) => setAddSender(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Action Required: Account Notice"
                    value={addSubject}
                    onChange={(e) => setAddSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Email Body *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Paste the email content here..."
                    value={addBody}
                    onChange={(e) => setAddBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Classification Label
                  </label>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      addLabel === 0
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="addLabel"
                        checked={addLabel === 0}
                        onChange={() => setAddLabel(0)}
                        className="accent-emerald-600 hidden"
                      />
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Safe Email (0)</span>
                    </label>

                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      addLabel === 1
                        ? 'border-red-300 bg-red-50 text-red-800 ring-2 ring-red-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="addLabel"
                        checked={addLabel === 1}
                        onChange={() => setAddLabel(1)}
                        className="accent-red-600 hidden"
                      />
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Phishing (1)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 disabled:opacity-50 transition-all cursor-pointer text-center"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingRecord && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-fade-in"
            onClick={() => setEditingRecord(null)}
          >
            <div
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 max-w-lg w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Edit Record #{editingRecord.id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-sm overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Sender Email
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRecord.sender}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, sender: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editingRecord.subject}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, subject: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Email Body
                  </label>
                  <textarea
                    rows={4}
                    value={editingRecord.body}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, body: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                    Classification Label
                  </label>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      editingRecord.label === 0
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="editLabel"
                        checked={editingRecord.label === 0}
                        onChange={() => setEditingRecord({ ...editingRecord, label: 0 })}
                        className="accent-emerald-600 hidden"
                      />
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Safe Email (0)</span>
                    </label>

                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      editingRecord.label === 1
                        ? 'border-red-300 bg-red-50 text-red-800 ring-2 ring-red-500/20'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="editLabel"
                        checked={editingRecord.label === 1}
                        onChange={() => setEditingRecord({ ...editingRecord, label: 1 })}
                        className="accent-red-600 hidden"
                      />
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span>Phishing (1)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 disabled:opacity-50 transition-all cursor-pointer text-center"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedRecord && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 animate-fade-in"
            onClick={() => setSelectedRecord(null)}
          >
            <div
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                    Record #{selectedRecord.id}
                  </span>
                  {selectedRecord.label === 1 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Phishing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Safe
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm overflow-y-auto flex-1 pr-1">
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block">Sender</span>
                  <span className="text-gray-900 font-medium break-all">{selectedRecord.sender || '—'}</span>
                </div>
                {selectedRecord.receiver && (
                  <div>
                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block">Receiver</span>
                    <span className="text-gray-800 break-all">{selectedRecord.receiver}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block">Domain</span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-indigo-700 font-medium text-xs px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100">
                      {selectedRecord.domain || '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleBlacklistClick(selectedRecord)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      title="Add domain to blacklist.json"
                    >
                      <ShieldBan className="w-3 h-3" />
                      Blacklist Domain
                    </button>
                  </div>
                </div>
                {selectedRecord.date && (
                  <div>
                    <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block">Date</span>
                    <span className="text-gray-700 text-xs">{selectedRecord.date}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block">Subject</span>
                  <span className="text-gray-900 font-semibold break-words">{selectedRecord.subject || '(No Subject)'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[11px] block mb-1">Body Preview</span>
                  <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-xl whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed max-h-56 sm:max-h-72 overflow-y-auto custom-scrollbar select-text">
                    {selectedRecord.body || '(Empty Body)'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 transition-all cursor-pointer"
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
