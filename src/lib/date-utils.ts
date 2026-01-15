/**
 * Utility functions for consistent date formatting across the application
 */

/**
 * Safely formats a date to French locale string
 * @param date - Date object, string, or number
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or fallback text
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) {
    return 'Date non disponible';
  }

  try {
    const dateObj = new Date(date);
    
    // Check if the date is invalid
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
}

/**
 * Safely formats a date with time to French locale string
 * @param date - Date object, string, or number
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date-time string or fallback text
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) {
    return 'Date non disponible';
  }

  try {
    const dateObj = new Date(date);
    
    // Check if the date is invalid
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }

    return dateObj.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return 'Date invalide';
  }
}

/**
 * Safely formats a time to French locale string
 * @param date - Date object, string, or number
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string or fallback text
 */
export function formatTime(
  date: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) {
    return 'Heure non disponible';
  }

  try {
    const dateObj = new Date(date);
    
    // Check if the date is invalid
    if (isNaN(dateObj.getTime())) {
      return 'Heure invalide';
    }

    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Heure invalide';
  }
}

/**
 * Returns a relative time string (e.g., "il y a 2 heures")
 * @param date - Date object, string, or number
 * @returns Relative time string or fallback text
 */
export function formatRelativeTime(date: Date | string | number | null | undefined): string {
  if (!date) {
    return 'Date non disponible';
  }

  try {
    const dateObj = new Date(date);
    
    // Check if the date is invalid
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'à l\'instant';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Date invalide';
  }
}