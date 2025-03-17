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
    // 'mercedes': '#27F4D2',
    // 'red_bull': '#3671C6',
    // 'ferrari': '#E80020',
    // 'mclaren': '#FF8000',
    // 'alpine': '#00A1E8',
    // 'rb': '#6692FF',
    // 'aston_martin': '#229971',
    // 'williams': '#1868DB',
    // 'sauber': '#52E252',
    // 'haas': '#B6BABD'
    'mercedes': 'rgb(39,244,210,.25)',
    'red_bull': 'rgb(54,113,198,.25)',
    'ferrari': 'rgb(232,0,32,.25)',
    'mclaren': 'rgb(255,128,0,.25)',
    'alpine': 'rgb(0,161,232,.25)',
    'rb': 'rgb(102,146,255,.25)',
    'aston_martin': 'rgb(34,153,113,.25)',
    'williams': 'rgb(24,104,219,.25)',
    'sauber': 'rgb(82,226,82,.25)',
    'haas': 'rgb(182,186,189,.25)'
  };
  
  return colors[constructorName] || '#333333';
}


export function getConstructorGradient(constructorName: string): string {
  const baseColor = getConstructorColor(constructorName);
  // Extract RGB values to create a darker shade for the gradient
  const rgbMatch = baseColor.match(/rgb\((\d+),(\d+),(\d+),([.\d]+)\)/);
  
  if (rgbMatch) {
    const [_, r, g, b, a] = rgbMatch;
    // Create a darker variant for the gradient (reducing brightness by ~30%)
    const darkerR = Math.max(0, parseInt(r) * 0.5);
    const darkerG = Math.max(0, parseInt(g) * 0.5);
    const darkerB = Math.max(0, parseInt(b) * 0.5);
    
    return `linear-gradient(180deg, ${baseColor} 0%, rgb(${darkerR},${darkerG},${darkerB},${a}) 100%)`;
  }
  
  return baseColor;
}