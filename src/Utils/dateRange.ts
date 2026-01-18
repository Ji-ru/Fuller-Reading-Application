export const getDateRangeForTimeFilter = (
  timeRange: 'week' | 'month' | 'year',
) => {
    const now = new Date();

    switch (timeRange) {
        case 'week': {
            const start = new Date();
            start.setDate(now.getDate() - 6); // Last 7 days
            start.setHours(0,0,0,0);
            return {start, end: now};
        }
        case 'month': {
            const start = new Date(now.getFullYear(),  now.getMonth(), 1);
            return {start, end: now};
        }
        case 'year': {
            // Academic year assumption: start June 1
            const year = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
            const start = new Date(year, 5, 1);
            return {start, end: now};
        }
    }

};
