/**
 * Centralized TypeScript types for the application
 */

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

// Report data
export interface Report {
  ngo_id: string;
  month: string;
  people_helped: number;
  events_conducted: number;
  funds_utilized: number;
}

// Job status for CSV uploads
export interface JobStatus {
  job_id: string;
  filename: string;
  status: JobStatusType;
  progress: number;
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: JobError[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type JobStatusType = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobError {
  row: number;
  error: string;
  data?: Record<string, string>;
}

// Dashboard statistics
export interface DashboardData {
  total_ngos_reporting: number;
  total_people_helped: number;
  total_events_conducted: number;
  total_funds_utilized: number;
}

// Dashboard with month
export interface MonthlyDashboardData extends DashboardData {
  month: string;
}

// NGO summary
export interface NGOSummary {
  ngo_id: string;
  reports_count: number;
  total_people_helped: number;
  total_events_conducted: number;
  total_funds_utilized: number;
}

// Form state
export interface FormStatus {
  type: 'success' | 'error' | null;
  message: string;
}

// Stat card configuration
export interface StatCardConfig {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  bgColor: string;
  isCurrency?: boolean;
}

// Month option for selectors
export interface MonthOption {
  value: string;
  label: string;
}

