/**
 * Formats a timestamp into a human-readable time
 */
export function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  // Handle different time formats
  if (timeString.includes(':')) {
    const [minutes, seconds, milliseconds] = timeString.split(/[:\.]/);
    return `${minutes}:${seconds}.${milliseconds}`;
  }
  
  return timeString;
}

/**
 * Formats a date string into a human-readable date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculates time difference between two dates
 */
export function getTimeDifference(date1: Date, date2: Date): string {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
}

/**
 * Gets a color for a constructor based on their name
 */
export function getConstructorColor(constructorName: string): string {
  const colors: Record<string, string> = {
    'Mercedes': '#00D2BE',
    'Red Bull': '#0600EF',
    'Ferrari': '#DC0000',
    'McLaren': '#FF8700',
    'Alpine': '#0090FF',
    'AlphaTauri': '#2B4562',
    'Aston Martin': '#006F62',
    'Williams': '#005AFF',
    'Alfa Romeo': '#900000',
    'Haas': '#FFFFFF'
  };
  
  return colors[constructorName] || '#333333';
}