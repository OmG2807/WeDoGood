/**
 * API client for NGO Impact Tracker
 * Centralized API calls with error handling and type safety
 */
import { API_BASE_URL } from './constants';
import type { 
  ApiResponse, 
  Report, 
  JobStatus, 
  DashboardData, 
  MonthlyDashboardData,
  NGOSummary 
} from './types';

// Re-export types for convenience
export type { Report, JobStatus, DashboardData, MonthlyDashboardData, NGOSummary, ApiResponse };

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'API_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling and timeout
 */
async function apiFetch<T>(
  endpoint: string, 
  options?: RequestInit & { timeout?: number }
): Promise<ApiResponse<T>> {
  const { timeout = 30000, ...fetchOptions } = options || {};

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new ApiError('Invalid response format', response.status);
    }

    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      throw new ApiError(
        data.error || 'Request failed',
        response.status,
        data.code
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out. Please try again.' };
      }
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Network error. Please check your connection.' };
  }
}

// ============ Report Endpoints ============

export async function submitReport(report: Report): Promise<ApiResponse<Report & { id: number }>> {
  return apiFetch('/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
}

export async function uploadCSV(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ job_id: string; filename: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  // Note: For actual upload progress, would need XMLHttpRequest
  // This is a simplified version using fetch
  return apiFetch('/reports/upload', { 
    method: 'POST', 
    body: formData,
    timeout: 60000, // 1 minute timeout for uploads
  });
}

// ============ Job Endpoints ============

export async function getJobStatus(jobId: string): Promise<ApiResponse<JobStatus>> {
  if (!jobId) {
    return { success: false, error: 'Job ID is required' };
  }
  return apiFetch(`/job-status/${encodeURIComponent(jobId)}`);
}

export async function getAllJobs(options?: { 
  status?: string; 
  limit?: number; 
  offset?: number;
}): Promise<ApiResponse<JobStatus[]>> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  
  const query = params.toString();
  return apiFetch(`/job-status${query ? `?${query}` : ''}`);
}

// ============ Dashboard Endpoints ============

export async function getDashboardData(month: string): Promise<ApiResponse<DashboardData> & { month?: string }> {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return { success: false, error: 'Invalid month format. Use YYYY-MM.' };
  }
  return apiFetch(`/dashboard?month=${encodeURIComponent(month)}`);
}

export async function getAvailableMonths(): Promise<ApiResponse<string[]>> {
  return apiFetch('/dashboard/months');
}

export async function getTrends(limit: number = 12): Promise<ApiResponse<MonthlyDashboardData[]>> {
  return apiFetch(`/dashboard/trends?limit=${Math.min(Math.max(1, limit), 100)}`);
}

export async function getAllNGOs(): Promise<ApiResponse<NGOSummary[]>> {
  return apiFetch('/dashboard/ngos');
}

export async function getPaginatedReports(options?: {
  month?: string;
  ngo_id?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{
  data: Report[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}>> {
  const params = new URLSearchParams();
  if (options?.month) params.set('month', options.month);
  if (options?.ngo_id) params.set('ngo_id', options.ngo_id);
  if (options?.page) params.set('page', String(options.page));
  if (options?.limit) params.set('limit', String(options.limit));
  
  const query = params.toString();
  return apiFetch(`/dashboard/reports${query ? `?${query}` : ''}`);
}

// ============ Health Check ============

export async function healthCheck(): Promise<{ status: string; timestamp: string; version?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      cache: 'no-store',
    });
    return response.json();
  } catch {
    return { status: 'error', timestamp: new Date().toISOString() };
  }
}
