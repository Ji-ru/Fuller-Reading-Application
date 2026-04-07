  /**
   * Convert duration string to hours (decimal)
   * Supports both formats:
   * - M:SS (0:15 = 15 seconds)
   * - HH:MM:SS (0:15:30 = 15 minutes 30 seconds)
   */
export const convertDurationToHours = (duration: string): number => {
    if (!duration) return 0;

    try {
      const parts = duration.split(':').map(part => parseInt(part) || 0);

      if (parts.length === 2) {
        // Format: M:SS (minutes:seconds)
        const minutes = parts[0];
        const seconds = parts[1];

        // Convert to hours: (minutes * 60 + seconds) / 3600
        const totalSeconds = minutes * 60 + seconds;
        return totalSeconds / 3600;
      } else if (parts.length === 3) {
        // Format: HH:MM:SS (hours:minutes:seconds)
        const hours = parts[0];
        const minutes = parts[1];
        const seconds = parts[2];

        return hours + minutes / 60 + seconds / 3600;
      } else {
        console.warn('Invalid duration format:', duration);
        return 0;
      }
    } catch (error) {
      console.error('Error converting duration:', duration, error);
      return 0;
    }
  };