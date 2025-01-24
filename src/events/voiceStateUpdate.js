module.exports = {
    name: 'voiceStateUpdate',
    execute(oldState, newState, bot) {
        const user = newState.member;
        if (!user) return;

        const userId = user.id;

        // Joining a voice channel
        if (!oldState.channel && newState.channel) {
            console.log(`${user.displayName} joined ${newState.channel.name}`);
            bot.timeTracker.addUser(userId, Date.now());
        }

        // Leaving a voice channel
        if (oldState.channel && !newState.channel) {
            console.log(`${user.displayName} left voice channel.`);
            const joinTime = bot.timeTracker.getJoinTime(userId);
            if (joinTime) {
                const timeSpent = Math.floor((Date.now() - joinTime) / 1000);
                bot.db.updateVoiceTime(userId, oldState.guild.id, timeSpent);
                console.log(`Updated final voice time for ${user.displayName} (+${timeSpent} seconds)`);
            }
            bot.timeTracker.removeUser(userId);
        }

        // Switching between voice channels
        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            console.log(`${user.displayName} switched from ${oldState.channel.name} to ${newState.channel.name}`);
            bot.timeTracker.addUser(userId, Date.now());
        }
    }
};