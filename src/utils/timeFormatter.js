function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
}

function formatTime(seconds) {
    if (seconds === 0) return '0 minutes';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    if (remainingSeconds > 0) result += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    
    return result.trim();
}

function formatTimeCompact(seconds) {
    if (seconds === 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (remainingSeconds > 0) result += `${remainingSeconds}s`;
    
    return result.trim();
}

function getPeriodOfDay(hours) {
    const periods = {
        morning: [5, 6, 7, 8, 9, 10, 11],
        afternoon: [12, 13, 14, 15, 16, 17],
        evening: [18, 19, 20, 21],
        night: [22, 23, 0, 1, 2, 3, 4]
    };
    
    for (const [period, periodHours] of Object.entries(periods)) {
        if (hours.some(h => periodHours.includes(h))) {
            return period.charAt(0).toUpperCase() + period.slice(1);
        }
    }
    return 'Unknown';
}

module.exports = { formatHour, formatTime, formatTimeCompact, getPeriodOfDay };