const { REST, Routes } = require('discord.js');

async function registerCommands(client, bot, token) {
    try {
        console.log('Started refreshing application (/) commands.');
        
        const commands = [];
        const commandFiles = bot.commands || new Map();
        
        console.log(`Found ${commandFiles.size} commands to register`);
        
        for (const command of commandFiles.values()) {
            commands.push(command.data);
            console.log(`Preparing to register command: ${command.data.name}`);
        }

        const rest = new REST({ version: '10' }).setToken(token);

        // Get all guilds the bot is in
        const guilds = Array.from(client.guilds.cache.values());
        if (guilds.length === 0) {
            console.error('Bot is not in any guilds!');
            return;
        }

        // Register commands for each guild
        for (const guild of guilds) {
            try {
                console.log(`Registering ${commands.length} commands for guild: ${guild.name} (${guild.id})`);
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, guild.id),
                    { body: commands }
                );
                console.log(`Successfully registered commands for guild: ${guild.name}`);
            } catch (error) {
                console.error(`Error registering commands for guild ${guild.name}:`, error);
            }
        }

        console.log('Finished registering commands for all guilds.');
    } catch (error) {
        console.error('Error in command registration:', error);
    }
}

module.exports = { registerCommands };