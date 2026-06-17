/**
 * Format a number with thousands separators (e.g., 10000 -> "10,000")
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format active/workout duration to a human-readable string (e.g., 75 -> "1h 15m")
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Format timestamp into a friendly date representation (e.g., "Today, 10:15 AM", "June 12")
 */
export const formatFriendlyDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    
    // Check if same day
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const timeString = date.toLocaleTimeString([], timeOptions);
    
    if (isToday) {
      return `Today, ${timeString}`;
    }
    if (isYesterday) {
      return `Yesterday, ${timeString}`;
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString([], dateOptions);
  } catch {
    return 'Unknown date';
  }
};
