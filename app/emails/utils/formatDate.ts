/**
 * Formats a date for the email list display
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const now = new Date();
  
  // Today
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // This year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Different year
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format date for email details view
 */
export function formatDetailDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
}

/**
 * Format date for email list items
 */
export function formatListDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    // Today, show time
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffDays < 7) {
    // Within a week, show day name
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    // Older, show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
} 