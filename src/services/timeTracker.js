class TimeTracker {
    constructor(client, database) {
        this.client = client;
        this.db = database;
        this.userVoiceStates = new Map();
    }

    startPeriodicUpdates() {
        setInterval(() => {
            const currentTime = Date.now();
            for (const [userId, joinTime] of this.userVoiceStates.entries()) {
                // Find the member in any guild they're active in
                let member = null;
                for (const guild of this.client.guilds.cache.values()) {
                    member = guild.members.cache.get(userId);
                    if (member && member.voice.channel) {
                        break;
                    }
                }
                
                if (member && member.voice.channel) {
                    this.db.updateVoiceTime(userId, member.guild.id, 5); // Update with 5 seconds
                    this.userVoiceStates.set(userId, currentTime); // Reset the join time
                    console.log(`Updated voice time for ${member.displayName} in ${member.guild.name} (+5 seconds)`);
                }
            }
        }, 5000); // Run every 5 seconds
    }

    addUser(userId, timestamp) {
        this.userVoiceStates.set(userId, timestamp);
    }

    removeUser(userId) {
        this.userVoiceStates.delete(userId);
    }

    getJoinTime(userId) {
        return this.userVoiceStates.get(userId);
    }
}

module.exports = TimeTracker;