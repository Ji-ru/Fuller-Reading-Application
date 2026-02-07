export const getDateRangeForTimeFilter = (timeRange: 'week' | 'month' | 'year') => {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case 'week':
      // Use Monday as start of week (ISO 8601). getDay(): 0=Sun, 1=Mon, ..., 6=Sat
      // Monday = 1, so days since Monday = (currentDay + 6) % 7, or 0 when Monday
      const currentDay = end.getDay();
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // Sun=6 days back to Mon
      
      // Start = Monday of this week, End = today (don't include future days like Sunday when it's Saturday)
      start.setDate(end.getDate() - daysSinceMonday);
      start.setHours(0, 0, 0, 0);
      
      // Set end to today at 23:59:59
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'month':
      start.setMonth(end.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
      
    case 'year':
      // School year: June (start) through August of next year
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth(); // 0=Jan, 5=Jun, 7=Aug, 11=Dec
      if (month >= 5) {
        // Jun–Dec: current school year = Jun this year – Aug next year
        start.setFullYear(year);
        start.setMonth(5); // June
        start.setDate(1);
        end.setFullYear(year + 1);
        end.setMonth(7); // August
        end.setDate(31);
      } else {
        // Jan–May: current school year = Jun last year – Aug this year
        start.setFullYear(year - 1);
        start.setMonth(5); // June
        start.setDate(1);
        end.setFullYear(year);
        end.setMonth(7); // August
        end.setDate(31);
      }
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
};