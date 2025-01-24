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
        const now = Date.now();
        let params = [userId, guildId];
        
        switch(period.toLowerCase()) {
            case 'daily':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (24 * 60 * 60 * 1000)); // 24 hours
                break;
            case 'weekly':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (7 * 24 * 60 * 60 * 1000)); // 7 days
                break;
            case 'monthly':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (30 * 24 * 60 * 60 * 1000)); // 30 days
                break;
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
        const now = Date.now();
        let params = [guildId];
        
        switch(period.toLowerCase()) {
            case 'daily':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (24 * 60 * 60 * 1000));
                break;
            case 'weekly':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (7 * 24 * 60 * 60 * 1000));
                break;
            case 'monthly':
                timeFilter = 'AND timestamp > ?';
                params.push(now - (30 * 24 * 60 * 60 * 1000));
                break;
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
}

module.exports = VoiceDatabase;