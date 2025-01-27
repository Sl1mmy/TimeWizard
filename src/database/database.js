const Database = require('better-sqlite3');
const { formatHour, getPeriodOfDay } = require('../utils/timeFormatter');

class VoiceDatabase {
    constructor() {
        this.db = new Database('./voice_time_tracker.db');
        this.initializeDatabase();
    }

    initializeDatabase() {
        this.db.prepare(`
            CREATE TABLE IF NOT EXISTS voice_times (
                user_id TEXT,
                guild_id TEXT,
                total_time INTEGER DEFAULT 0,
                timestamp INTEGER,
                PRIMARY KEY (user_id, guild_id, timestamp)
            )
        `).run();
    }

    updateVoiceTime(userId, guildId, timeSpent) {
        const timestamp = Date.now();
        const stmt = this.db.prepare(`
            INSERT INTO voice_times (user_id, guild_id, total_time, timestamp)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(userId, guildId, timeSpent, timestamp);
    }

    getUserVoiceTime(userId, guildId, period = 'all') {
        let timeFilter = '';
        let params = [userId, guildId];
        
        switch(period.toLowerCase()) {
            case 'daily': {
                // Get current date in UTC
                const now = new Date();
                
                // Calculate today's midnight in CT (UTC-5)
                const midnightCT = new Date(now);
                midnightCT.setHours(5, 0, 0, 0); // 5 AM UTC = Midnight CT
                
                // If current UTC time is before 5 AM, we need previous day's 5 AM
                if (now.getUTCHours() < 5) {
                    midnightCT.setDate(midnightCT.getDate() - 1);
                }
                
                timeFilter = 'AND timestamp >= ?';
                params.push(midnightCT.getTime());
                break;
            }
            case 'weekly': {
                const today = new Date();
                const centralToday = getCentralTime(today);
                centralToday.setHours(0, 0, 0, 0);
                // Set to last Sunday
                centralToday.setDate(centralToday.getDate() - centralToday.getDay());
                
                // Convert back to UTC for database comparison
                const centralWeekStartUTC = new Date(centralToday.getTime() + (5 * 60 * 60 * 1000));
                
                timeFilter = 'AND timestamp >= ?';
                params.push(centralWeekStartUTC.getTime());
                break;
            }
            case 'monthly': {
                // Get timestamp for 1st of current month in Central Time
                const today = new Date();
                const centralToday = getCentralTime(today);
                const firstOfMonth = new Date(centralToday.getFullYear(), centralToday.getMonth(), 1);
                firstOfMonth.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfMonth.getTime());
                break;
            }
            case 'yearly': {
                // Get timestamp for January 1st of current year in Central Time
                const today = new Date();
                const centralToday = getCentralTime(today);
                const firstOfYear = new Date(centralToday.getFullYear(), 0, 1);
                firstOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfYear.getTime());
                break;
            }
        }

        const query = `
            SELECT COALESCE(SUM(total_time), 0) as total_time 
            FROM voice_times 
            WHERE user_id = ? 
            AND guild_id = ? 
            ${timeFilter}
        `;
        
        const result = this.db.prepare(query).get(...params);
        return result.total_time;
    }

    getLeaderboard(guildId, period = 'all') {
        let timeFilter = '';
        let params = [guildId];
        
        // Helper function to get UTC-5 timestamp
        const getCentralTime = (date) => {
            const utcDate = new Date(date);
            utcDate.setHours(utcDate.getHours() + 5);
            return utcDate;
        };
        
        switch(period.toLowerCase()) {
            case 'daily': {
                const today = new Date();
                const centralMidnight = getCentralTime(today);
                centralMidnight.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(centralMidnight.getTime());
                break;
            }
            case 'weekly': {
                const today = new Date();
                const centralToday = getCentralTime(today);
                const monday = new Date(centralToday);
                monday.setDate(centralToday.getDate() - centralToday.getDay() + (centralToday.getDay() === 0 ? -6 : 1));
                monday.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(monday.getTime());
                break;
            }
            case 'monthly': {
                const today = new Date();
                const centralToday = getCentralTime(today);
                const firstOfMonth = new Date(centralToday.getFullYear(), centralToday.getMonth(), 1);
                firstOfMonth.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfMonth.getTime());
                break;
            }
            case 'yearly': {
                const today = new Date();
                const centralToday = getCentralTime(today);
                const firstOfYear = new Date(centralToday.getFullYear(), 0, 1);
                firstOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfYear.getTime());
                break;
            }
        }

        const stmt = this.db.prepare(`
            SELECT user_id, COALESCE(SUM(total_time), 0) as total_time 
            FROM voice_times 
            WHERE guild_id = ? ${timeFilter}
            GROUP BY user_id 
            ORDER BY total_time DESC 
            LIMIT 10
        `);
        
        return stmt.all(...params);
    }

    getUserAverageTime(userId, guildId, period = 'all') {
        let timeFilter = '';
        let params = [userId, guildId];
        let periodStart;
        
        switch(period.toLowerCase()) {
            case 'daily': {
                // Get timestamp for the first record or the start of the year, whichever is later
                const startOfYear = new Date();
                startOfYear.setMonth(0, 1);
                startOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                periodStart = startOfYear.getTime();
                params.push(periodStart);
                break;
            }
            case 'weekly': {
                // Get timestamp for the first record or start of the year
                const startOfYear = new Date();
                startOfYear.setMonth(0, 1);
                startOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                periodStart = startOfYear.getTime();
                params.push(periodStart);
                break;
            }
            case 'monthly': {
                // Get timestamp for the first record or start of the year
                const startOfYear = new Date();
                startOfYear.setMonth(0, 1);
                startOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                periodStart = startOfYear.getTime();
                params.push(periodStart);
                break;
            }
            case 'yearly': {
                // Get timestamp for the first record
                const startOfData = new Date(2020, 0, 1); // Or any reasonable start date
                startOfData.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                periodStart = startOfData.getTime();
                break;
            }
        }

        const stmt = this.db.prepare(`
            SELECT 
                COALESCE(SUM(total_time), 0) as total_time,
                MIN(timestamp) as first_record
            FROM voice_times 
            WHERE user_id = ? 
            AND guild_id = ? 
            ${timeFilter}
        `);
        
        const result = stmt.get(...params);
        const totalTime = result.total_time || 0;
        const firstRecord = result.first_record || Date.now();
        
        // Calculate the number of periods (days/weeks/months) since the first record
        const now = Date.now();
        let numberOfPeriods = 1; // Default to 1 to avoid division by zero
        
        // Move declarations outside switch
        let firstDate, currentDate;
        
        switch(period.toLowerCase()) {
            case 'daily':
                numberOfPeriods = Math.max(1, Math.ceil((now - firstRecord) / (24 * 60 * 60 * 1000)));
                break;
            case 'weekly':
                numberOfPeriods = Math.max(1, Math.ceil((now - firstRecord) / (7 * 24 * 60 * 60 * 1000)));
                break;
            case 'monthly':
                firstDate = new Date(firstRecord);
                currentDate = new Date(now);
                numberOfPeriods = Math.max(1, 
                    (currentDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                    (currentDate.getMonth() - firstDate.getMonth()) + 1);
                break;
            case 'yearly':
                firstDate = new Date(firstRecord);
                currentDate = new Date(now);
                numberOfPeriods = Math.max(1, currentDate.getFullYear() - firstDate.getFullYear() + 1);
                break;
        }
        
        return Math.floor(totalTime / numberOfPeriods);
    }

    getActivitySchedule(userId, guildId) {
        // Get day of week distribution
        const dayStmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%w', datetime(timestamp/1000, 'unixepoch', 'localtime')) AS INTEGER) as day_of_week,
                SUM(total_time) as total_time
            FROM voice_times 
            WHERE user_id = ? AND guild_id = ?
            GROUP BY day_of_week
            ORDER BY total_time DESC
        `);
        const dayResults = dayStmt.all(userId, guildId);
        
        // Get hour distribution
        const hourStmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%H', datetime(timestamp/1000, 'unixepoch', 'localtime')) AS INTEGER) as hour,
                SUM(total_time) as total_time
            FROM voice_times 
            WHERE user_id = ? AND guild_id = ?
            GROUP BY hour
            ORDER BY total_time DESC
        `);
        const hourResults = hourStmt.all(userId, guildId);
        
        // Process results
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostActiveDay = days[dayResults[0]?.day_of_week || 0];
        const isWeekendActive = dayResults.some(d => (d.day_of_week === 0 || d.day_of_week === 6) && d.total_time > 0);
        
        // Find peak hours (consecutive hours with highest activity)
        let peakStart = hourResults[0]?.hour || 0;
        let peakEnd = (peakStart + 1) % 24;
        
        return {
            mostActive: isWeekendActive ? "Weekends" : "Weekdays",
            peakHours: `${formatHour(peakStart)}-${formatHour(peakEnd)} CT`,
            leastActive: getPeriodOfDay(hourResults.slice(-3).map(h => h.hour)),
            hourlyData: hourResults,
            dailyData: dayResults
        };
    }

    getOptimalTime(guildId) {
        // Get overall server activity patterns
        const stmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%H', datetime(timestamp/1000, 'unixepoch', 'localtime')) AS INTEGER) as hour,
                COUNT(DISTINCT user_id) as unique_users,
                SUM(total_time) as total_time
            FROM voice_times 
            WHERE guild_id = ?
            GROUP BY hour
            ORDER BY unique_users DESC, total_time DESC
        `);
        
        return stmt.all(guildId);
    }

    getServerActivitySchedule(guildId) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        // Get hourly distribution with unique users
        const hourStmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%H', datetime(timestamp/1000, 'unixepoch', 'localtime')) AS INTEGER) as hour,
                SUM(total_time) as total_time,
                COUNT(DISTINCT user_id) as unique_users
            FROM voice_times 
            WHERE guild_id = ? 
            AND timestamp >= ?
            GROUP BY hour
            ORDER BY hour ASC
        `);
        const hourResults = hourStmt.all(guildId, thirtyDaysAgo);

        // Get daily distribution with unique users
        const dayStmt = this.db.prepare(`
            SELECT 
                CAST(strftime('%w', datetime(timestamp/1000, 'unixepoch', 'localtime')) AS INTEGER) as day_of_week,
                SUM(total_time) as total_time,
                COUNT(DISTINCT user_id) as unique_users
            FROM voice_times 
            WHERE guild_id = ? 
            AND timestamp >= ?
            GROUP BY day_of_week
            ORDER BY day_of_week ASC
        `);
        const dayResults = dayStmt.all(guildId, thirtyDaysAgo);

        // Get overall statistics
        const statsStmt = this.db.prepare(`
            SELECT 
                COUNT(DISTINCT user_id) as total_users,
                SUM(total_time) as total_time
            FROM voice_times 
            WHERE guild_id = ? 
            AND timestamp >= ?
        `);
        const stats = statsStmt.get(guildId, thirtyDaysAgo);

        // Calculate average daily users
        const avgDailyStmt = this.db.prepare(`
            SELECT COUNT(DISTINCT user_id) as users
            FROM voice_times 
            WHERE guild_id = ? 
            AND timestamp >= ?
            GROUP BY DATE(datetime(timestamp/1000, 'unixepoch', 'localtime'))
        `);
        const dailyUsers = avgDailyStmt.all(guildId, thirtyDaysAgo);
        const avgDailyUsers = Math.round(dailyUsers.reduce((sum, day) => sum + day.users, 0) / dailyUsers.length) || 0;

        // Find peak hours
        const peakHour = hourResults.reduce((max, curr) => 
            curr.total_time > max.total_time ? curr : max, 
            { total_time: 0 }
        );

        // Find most active day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostActiveDay = dayResults.reduce((max, curr) => 
            curr.total_time > max.total_time ? curr : max, 
            { total_time: 0 }
        );

        return {
            hourlyData: hourResults,
            dailyData: dayResults,
            totalUsers: stats.total_users || 0,
            totalTime: stats.total_time || 0,
            avgDailyUsers,
            peakHours: `${formatHour(peakHour.hour)} CT`,
            mostActive: days[mostActiveDay.day_of_week],
        };
    }
}

module.exports = VoiceDatabase;