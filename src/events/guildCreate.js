const { registerCommands } = require('../utils/commandRegister');

module.exports = {
    name: 'guildCreate',
    async execute(guild, bot) {
        console.log(`Joined new guild: ${guild.name}`);
        try {
            // Re-register commands for the new guild
            await registerCommands(bot.client, bot, bot.client.token);
        } catch (error) {
            console.error(`Failed to register commands for new guild ${guild.name}:`, error);
        }
    }
};