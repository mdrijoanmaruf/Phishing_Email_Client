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
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Lock,
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
      <div className="space-y-6 max-w-7xl">
        {/* Module Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-700 to-indigo-900 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                <ShieldBan className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">Sender Domain Blacklist</h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                    {domains.length} Blocked
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Domains in this blacklist incur an immediate +40 point penalty in the RuleEngine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchDomains}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Add Domain Input Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Suspicious Domain to Blocklist
          </h2>
          <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter domain name (e.g. secure-login-verify.xyz) or sender email..."
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newDomain.trim()}
              className="px-6 py-2.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-indigo-800 hover:to-indigo-950 shadow-md shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {adding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  Block Domain
                </>
              )}
            </button>
          </form>
          <p className="text-[11px] text-gray-400 mt-2">
            Tip: You can paste full URLs or email addresses; the domain name will be automatically normalized.
          </p>
        </div>

        {/* Search & Domains Table Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blacklisted domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
              Showing <span className="font-bold text-gray-900">{filteredDomains.length}</span> of{' '}
              <span className="font-bold text-gray-900">{domains.length}</span> entries
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
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
                          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-mono text-xs font-bold border border-red-100">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-gray-900">{domain}</span>
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
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors inline-flex items-center gap-1"
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
