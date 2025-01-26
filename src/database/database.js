const Database = require('better-sqlite3');

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
                // Get timestamp for today at midnight
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(today.getTime());
                break;
            }
            case 'weekly': {
                // Get timestamp for Monday of current week
                const today = new Date();
                const monday = new Date(today);
                monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                monday.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(monday.getTime());
                break;
            }
            case 'monthly': {
                // Get timestamp for 1st of current month
                const today = new Date();
                const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                firstOfMonth.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfMonth.getTime());
                break;
            }
            case 'yearly': {
                // Get timestamp for January 1st of current year
                const today = new Date();
                const firstOfYear = new Date(today.getFullYear(), 0, 1);
                firstOfYear.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfYear.getTime());
                break;
            }
        }

        const stmt = this.db.prepare(`
            SELECT COALESCE(SUM(total_time), 0) as total_time 
            FROM voice_times 
            WHERE user_id = ? 
            AND guild_id = ? 
            ${timeFilter}
        `);
        
        const result = stmt.get(...params);
        return result.total_time || 0;
    }

    getLeaderboard(guildId, period = 'all') {
        let timeFilter = '';
        let params = [guildId];
        
        switch(period.toLowerCase()) {
            case 'daily': {
                // Get timestamp for today at midnight
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(today.getTime());
                break;
            }
            case 'weekly': {
                // Get timestamp for Monday of current week
                const today = new Date();
                const monday = new Date(today);
                monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
                monday.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(monday.getTime());
                break;
            }
            case 'monthly': {
                // Get timestamp for 1st of current month
                const today = new Date();
                const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                firstOfMonth.setHours(0, 0, 0, 0);
                timeFilter = 'AND timestamp >= ?';
                params.push(firstOfMonth.getTime());
                break;
            }
            case 'yearly': {
                // Get timestamp for January 1st of current year
                const today = new Date();
                const firstOfYear = new Date(today.getFullYear(), 0, 1);
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
                params.push(periodStart);
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
}

module.exports = VoiceDatabase;