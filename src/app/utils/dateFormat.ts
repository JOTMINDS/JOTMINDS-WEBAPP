// JotMinds - Centralized Date Formatting Utility
// Ensures consistent date formatting across the entire application

/**
 * Standard date format: Dec 1, 2025 – 1:38 PM
 * Used for displaying timestamps with date and time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${dateStr} – ${timeStr}`;
}

/**
 * Short date format: Dec 1, 2025
 * Used for date-only displays
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Month and year only: Dec 2025
 * Used for "Member Since" and similar displays
 */
export function formatMonthYear(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Short format for charts: Dec 1
 * Used in chart axis labels
 */
export function formatChartDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Time only: 1:38 PM
 * Used when date is shown separately
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
