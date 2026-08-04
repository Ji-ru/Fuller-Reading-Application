// utils/academicYearUtils.ts

/**
 * Get the current academic year based on system date
 * Assumes academic year runs from June to May
 */
export const getCurrentAcademicYear = (): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // January = 1

    // If month is June (6) or later, current academic year is currentYear-currentYear+1
    // If month is before June, current academic year is previousYear-currentYear
    if (currentMonth >= 6) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  /**
   * Get the next academic year
   */
  export const getNextAcademicYear = (): string => {
    const [startYear, endYear] = getCurrentAcademicYear().split('-').map(Number);
    return `${startYear + 1}-${endYear + 1}`;
  };

  /**
   * Get the previous academic year
   */
  export const getPreviousAcademicYear = (): string => {
    const [startYear, endYear] = getCurrentAcademicYear().split('-').map(Number);
    return `${startYear - 1}-${endYear - 1}`;
  };

  /**
   * Generate academic year options for dropdown
   * Default: 2 years back, current year, 2 years forward
   */
  export const getAcademicYearOptions = (): string[] => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1–12

    // Determine the start year of the current academic year
    const startYear = currentMonth >= 6 ? currentYear : currentYear - 1;

    const optionsSet = new Set<string>();
    optionsSet.add(`${startYear}-${startYear + 1}`);          // current
    optionsSet.add(`${startYear - 1}-${startYear}`);         // previous
    optionsSet.add(`${startYear + 1}-${startYear + 2}`);     // next

    // Convert to array and sort descending (most recent first)
    return Array.from(optionsSet).sort().reverse();
  };

  /**
   * Format academic year for display
   */
  export const formatAcademicYear = (acadYear: string): string => {
    return `SY ${acadYear}`;
  };

  /**
   * Extract start year from academic year string
   */
  export const getStartYearFromAcademicYear = (acadYear: string): number => {
    const match = acadYear.match(/^(\d{4})/);
    return match ? parseInt(match[1], 10) : new Date().getFullYear();
  };

  /**
   * Validate academic year format
   */
  export const isValidAcademicYear = (acadYear: string): boolean => {
    const regex = /^(\d{4})-(\d{4})$/;
    const match = acadYear.match(regex);

    if (!match) return false;

    const startYear = parseInt(match[1], 10);
    const endYear = parseInt(match[2], 10);

    // Check if end year is exactly start year + 1
    return endYear === startYear + 1;
  };

  