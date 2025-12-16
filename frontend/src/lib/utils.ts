/**
 * Shared utility functions for formatting and common operations
 */

/**
 * Format currency in Indian format (Lakhs, Crores)
 */
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return `₹${amount.toFixed(2)}`;
}

/**
 * Format large numbers (K, M)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format month string (YYYY-MM) to human readable format
 */
export function formatMonth(monthStr: string): string {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

/**
 * Get short month name from month string
 */
export function getShortMonth(monthStr: string): string {
  if (!monthStr) return "";
  const [, month] = monthStr.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[parseInt(month) - 1] || monthStr;
}

/**
 * Generate month options for dropdowns (last N months)
 */
export function getMonthOptions(count: number = 24): Array<{ value: string; label: string }> {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    options.push({ value, label });
  }
  
  return options;
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get status color classes for job status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-[var(--color-success)] bg-[var(--color-success)]/10";
    case "failed":
      return "text-[var(--color-error)] bg-[var(--color-error)]/10";
    case "processing":
      return "text-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10";
    default:
      return "text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]";
  }
}

/**
 * Classnames utility - combines class strings
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

