/**
 * API client for PhishGuard Flask server.
 */

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

/**
 * Fetch paginated email records from GET /api/dataset
 */
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

/**
 * Search and filter dataset from GET /api/dataset/search
 */
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

/**
 * Add a new email record via POST /api/dataset
 */
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

/**
 * Update an existing record via PUT /api/dataset/<id>
 */
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

/**
 * Delete a record via DELETE /api/dataset/<id>
 */
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

/**
 * Get the download URL for CSV export
 */
export function getExportCsvUrl(query?: string, label?: string | number, domain?: string): string {
  const params: Record<string, string> = {};
  if (query && query.trim()) params.q = query.trim();
  if (label !== undefined && label !== '' && label !== 'all') params.label = String(label);
  if (domain && domain.trim()) params.domain = domain.trim();

  const qs = new URLSearchParams(params).toString();
  return `${API_BASE_URL}/api/dataset/export${qs ? `?${qs}` : ''}`;
}
