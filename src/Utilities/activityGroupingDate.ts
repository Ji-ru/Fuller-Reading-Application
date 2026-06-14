export function getPeriodLabels(timeRange: 'week' | 'month' | 'year'): string[] {
    if (timeRange === 'week') {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    if (timeRange === 'month') {
        return ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'];
    }
    return [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
}

export function getLabelForDate(date: Date, timeRange: 'week' | 'month' | 'year'): string {
    if (timeRange === 'week') {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    if (timeRange === 'month') {
        return `Wk ${Math.ceil(date.getDate() / 7)}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short' });
}
