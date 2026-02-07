export const getDateRangeForTimeFilter = (timeRange: 'week' | 'month' | 'year') => {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case 'week':
      // Get current day of week (0 = Sunday, 6 = Saturday)
      const currentDay = end.getDay();
      
      // Calculate days to subtract to get to Sunday
      const daysToSubtract = currentDay;
      
      // Set start to Sunday at 00:00:00
      start.setDate(end.getDate() - daysToSubtract);
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
      start.setFullYear(end.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
};