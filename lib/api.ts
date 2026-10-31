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
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dataset: ${res.statusText}`);
  }

  return res.json();
}
