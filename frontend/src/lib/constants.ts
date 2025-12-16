/**
 * Application constants - centralized configuration
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Color palette (matches CSS variables)
export const COLORS = {
  sage: '#606c38',
  sageLight: '#8b9a6d',
  terracotta: '#bc6c25',
  sand: '#dda15e',
  cream: '#fefae0',
  accentPrimary: '#c44536',
  accentSecondary: '#772e25',
  accentTertiary: '#283618',
  success: '#4a7c59',
  warning: '#e9c46a',
  error: '#c44536',
  textPrimary: '#2d3436',
  textSecondary: '#636e72',
  textMuted: '#a0a8ab',
  bgPrimary: '#faf8f5',
  bgSecondary: '#f5f0e8',
  bgAccent: '#e8e0d5',
} as const;

// Chart configuration
export const CHART_CONFIG = {
  grid: { strokeDasharray: '3 3', stroke: COLORS.bgAccent },
  axis: { stroke: COLORS.textMuted, fontSize: 12 },
  tooltip: {
    backgroundColor: 'white',
    border: `1px solid ${COLORS.bgAccent}`,
    borderRadius: '8px',
  },
  gradients: {
    people: { color: COLORS.sage, startOpacity: 0.3, endOpacity: 0 },
    funds: { color: COLORS.terracotta, startOpacity: 0.3, endOpacity: 0 },
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;

// Polling intervals (ms)
export const POLLING = {
  jobStatus: 1000,
  healthCheck: 30000,
} as const;

// Month options count
export const MONTH_OPTIONS_COUNT = 24;

// File upload constraints
export const UPLOAD = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.csv'],
  mimeTypes: ['text/csv'],
} as const;

// Validation patterns
export const PATTERNS = {
  month: /^\d{4}-\d{2}$/,
  ngoId: /^[a-zA-Z0-9\-_]+$/,
} as const;

// Animation delays (for staggered animations)
export const ANIMATION_DELAYS = {
  fast: 100,
  medium: 200,
  slow: 300,
} as const;

// Status colors for job statuses
export const STATUS_COLORS = {
  pending: { bg: 'var(--color-bg-secondary)', text: 'var(--color-text-muted)' },
  processing: { bg: 'var(--color-terracotta)', text: 'var(--color-terracotta)' },
  completed: { bg: 'var(--color-success)', text: 'var(--color-success)' },
  failed: { bg: 'var(--color-error)', text: 'var(--color-error)' },
} as const;
