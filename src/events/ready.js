module.exports = {
    name: 'ready',
    once: true,
    execute(client, bot) {
        console.log(`Logged in as ${client.user.tag}!`);
        
        // Check all guilds for users in voice channels
        client.guilds.cache.forEach(guild => {
            guild.channels.cache.forEach(channel => {
                if (channel.type === 2) { // 2 is the type for voice channels
                    channel.members.forEach(member => {
                        console.log(`Found ${member.displayName} in ${channel.name}`);
                        bot.timeTracker.addUser(member.id, Date.now());
                    });
                }
            });
        });
    }
};