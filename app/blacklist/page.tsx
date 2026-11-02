'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ShieldBan,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  Globe,
  ShieldAlert,
  Lock,
  X,
} from 'lucide-react';
import { getBlacklist, addToBlacklist, removeFromBlacklist } from '@/lib/api';
import { showSuccessToast, showErrorAlert, showConfirmDelete } from '@/lib/alerts';

export default function BlacklistPage() {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<string | null>(null);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await getBlacklist();
      setDomains(res.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch blacklist';
      showErrorAlert('Fetch Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomain.trim().toLowerCase();
    if (!clean) {
      showErrorAlert('Invalid Input', 'Please enter a domain name or sender address.');
      return;
    }

    setAdding(true);
    try {
      const res = await addToBlacklist(clean);
      showSuccessToast(res.message || `Domain '${clean}' added to blacklist!`);
      setNewDomain('');
      fetchDomains();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add domain to blacklist';
      showErrorAlert('Blacklist Failed', msg);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (domain: string) => {
    const confirmed = await showConfirmDelete(
      `Remove ${domain}?`,
      `Emails originating from '${domain}' will no longer be penalized automatically by the blacklist rule.`
    );
    if (!confirmed) return;

    setDeletingDomain(domain);
    try {
      await removeFromBlacklist(domain);
      showSuccessToast(`Domain '${domain}' removed from blacklist!`);
      setDomains((prev) => prev.filter((d) => d !== domain));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove domain';
      showErrorAlert('Removal Failed', msg);
    } finally {
      setDeletingDomain(null);
    }
  };

  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return domains;
    const q = searchQuery.toLowerCase().trim();
    return domains.filter((d) => d.toLowerCase().includes(q));
  }, [domains, searchQuery]);

  return (
    <DashboardLayout pageTitle="Domain Blacklist System">
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 shrink-0">
                <ShieldBan className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                    Sender Domain Blacklist
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 shrink-0">
                    {domains.length} Blocked
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
                  Domains in this blacklist
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={fetchDomains}
                disabled={loading}
                className="w-full sm:w-auto justify-center px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Blacklist</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Add Suspicious Domain to Blocklist</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter a domain or email address to instantly penalize all associated inbound messages
            </p>
          </div>

          <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. secure-login-verify.xyz or user@scamdomain.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white placeholder-gray-400 text-gray-800 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newDomain.trim()}
              className="px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl text-white bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {adding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Block Domain</span>
                </>
              )}
            </button>
          </form>
         
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search blacklisted domains..."
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

            <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
              Showing <span className="font-bold text-gray-900">{filteredDomains.length}</span> of{' '}
              <span className="font-bold text-gray-900">{domains.length}</span> domains
            </div>
          </div>

          <div className="block md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2 animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                    <div className="h-5 bg-gray-100 rounded-full w-24" />
                  </div>
                </div>
              ))
            ) : filteredDomains.length === 0 ? (
              <div className="p-8 text-center">
                <ShieldBan className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-700">No Domains Found</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery
                    ? 'No blacklisted domains matched your search criteria.'
                    : 'Your blacklist is currently empty. Add a suspicious domain above.'}
                </p>
              </div>
            ) : (
              filteredDomains.map((domain) => (
                <div
                  key={domain}
                  className="p-4 hover:bg-gray-50/60 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        <Lock className="w-3 h-3" />
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {domain}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        +40 Pts Penalty
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        Active Block
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(domain)}
                    disabled={deletingDomain === domain}
                    className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    title="Remove domain from blacklist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">
                      {deletingDomain === domain ? '...' : 'Unblock'}
                    </span>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-6">Domain Name</th>
                  <th className="py-3 px-6">Enforcement Rule</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading blacklisted domains...
                    </td>
                  </tr>
                ) : filteredDomains.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <ShieldBan className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-700">No Domains Found</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchQuery
                          ? 'No blacklisted domains matched your search criteria.'
                          : 'Your blacklist is currently empty. Add a suspicious domain above.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDomains.map((domain) => (
                    <tr key={domain} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-mono text-xs font-bold border border-red-100 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold text-gray-900 truncate block">
                              {domain}
                            </span>
                            <p className="text-[10px] text-gray-400">All subdomains blocked</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          +40 Pts Penalty
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          Active Block
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(domain)}
                          disabled={deletingDomain === domain}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingDomain === domain ? 'Removing...' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
