const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface EmailRecordItem {
  id: string;
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  label: 0 | 1;
  label_text: 'Safe' | 'Phishing';
  date: string;
  urls: string[];
  domain: string;
}

export interface PaginatedDatasetResponse {
  success: boolean;
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  count: number;
  data: EmailRecordItem[];
  error?: string;
  message?: string;
}

export interface HistoryLogItem {
  id: string;
  timestamp: string;
  action: 'ADD' | 'EDIT' | 'DELETE' | 'VIEW' | 'BLACKLIST_ADD' | 'BLACKLIST_REMOVE' | string;
  entity_type: 'EMAIL' | 'BLACKLIST' | 'DATASET' | string;
  entity_id: string;
  summary: string;
  details?: Record<string, any>;
  actor: string;
}

export type ScanResult = HistoryLogItem;

export interface AnalyticsSummary {
  total_dataset_records: number;
  phishing_count: number;
  safe_count: number;
  phishing_percentage: number;
  total_scans_performed: number;
  blacklisted_domains_count: number;
  recent_scans_breakdown: {
    safe: number;
    suspicious: number;
    phishing: number;
  };
}

export interface ScoresStatistics {
  sample_size: number;
  mean: number;
  std: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  histogram: {
    range: string;
    count: number;
    percentage: number;
  }[];
}

export interface KeywordItem {
  keyword: string;
  count: number;
  percentage: number;
}

export interface DomainItem {
  domain: string;
  phishing_count: number;
}

export async function getDataset(
  page: number = 1,
  perPage: number = 20,
  all: boolean = false
): Promise<PaginatedDatasetResponse> {
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    ...(all ? { all: 'true' } : {}),
  });

  const res = await fetch(`${API_BASE_URL}/api/dataset?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch dataset: ${res.statusText}`);
  }

  return res.json();
}

export async function searchDataset(
  searchQuery?: string,
  label?: string | number,
  domain?: string,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedDatasetResponse> {
  const params: Record<string, string> = {
    page: String(page),
    per_page: String(perPage),
  };

  if (searchQuery && searchQuery.trim()) {
    params.q = searchQuery.trim();
  }
  if (label !== undefined && label !== '' && label !== 'all') {
    params.label = String(label);
  }
  if (domain && domain.trim()) {
    params.domain = domain.trim();
  }

  const query = new URLSearchParams(params);

  const res = await fetch(`${API_BASE_URL}/api/dataset/search?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to search dataset: ${res.statusText}`);
  }

  return res.json();
}

export async function addDatasetRecord(data: {
  sender: string;
  subject: string;
  body: string;
  label: 0 | 1;
  id?: string;
}): Promise<{ success: boolean; message: string; data?: EmailRecordItem }> {
  const res = await fetch(`${API_BASE_URL}/api/dataset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to add email record');
  }

  return json;
}

export async function updateDatasetRecord(
  id: string,
  data: Partial<EmailRecordItem>
): Promise<{ success: boolean; message: string; data?: EmailRecordItem }> {
  const res = await fetch(`${API_BASE_URL}/api/dataset/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update email record');
  }

  return json;
}

export async function deleteDatasetRecord(
  id: string
): Promise<{ success: boolean; message: string; id: string }> {
  const res = await fetch(`${API_BASE_URL}/api/dataset/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete email record');
  }

  return json;
}

export function getExportCsvUrl(query?: string, label?: string | number, domain?: string): string {
  const params: Record<string, string> = {};
  if (query && query.trim()) params.q = query.trim();
  if (label !== undefined && label !== '' && label !== 'all') params.label = String(label);
  if (domain && domain.trim()) params.domain = domain.trim();

  const qs = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/api/dataset/export${qs ? `?${qs}` : ''}`;
}

export async function getBlacklist(): Promise<{ success: boolean; count: number; data: string[] }> {
  const res = await fetch(`${API_BASE_URL}/api/blacklist`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch blacklist');
  }

  return json;
}

export async function addToBlacklist(domain: string): Promise<{ success: boolean; message: string; domain: string; count: number }> {
  const res = await fetch(`${API_BASE_URL}/api/blacklist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to add domain to blacklist');
  }

  return json;
}

export async function removeFromBlacklist(domain: string): Promise<{ success: boolean; message: string; count: number }> {
  const res = await fetch(`${API_BASE_URL}/api/blacklist/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to remove domain from blacklist');
  }

  return json;
}

export async function getHistory(
  action?: string,
  entityType?: string,
  limit: number = 200
): Promise<{ success: boolean; count: number; total: number; data: HistoryLogItem[] }> {
  const params: Record<string, string> = { limit: String(limit) };
  if (action && action !== 'ALL') {
    params.action = action;
  }
  if (entityType && entityType !== 'ALL') {
    params.entity_type = entityType;
  }

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/api/history${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Failed to fetch history logs');
  }

  return json;
}

export async function logActivity(payload: {
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  details?: Record<string, any>;
  actor?: string;
}): Promise<{ success: boolean; data: HistoryLogItem }> {
  const res = await fetch(`${API_BASE_URL}/api/history/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to record activity log');
  }

  return json;
}

export async function deleteHistoryItem(id: string): Promise<{ success: boolean; message: string; count: number }> {
  const res = await fetch(`${API_BASE_URL}/api/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to delete history record');
  }

  return json;
}

export async function clearAllHistory(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/history`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to clear scan history');
  }

  return json;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/summary`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch analytics summary');
  }

  return json.data;
}

export async function getScoresStatistics(): Promise<ScoresStatistics> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/scores`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch scores statistics');
  }

  return json.data;
}

export async function getTopKeywords(): Promise<KeywordItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/top-keywords`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch top keywords');
  }

  return json.data;
}

export async function getDomainBreakdown(): Promise<DomainItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/analytics/domain-breakdown`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to fetch domain breakdown');
  }

  return json.data;
}
