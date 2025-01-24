const { REST, Routes } = require('discord.js');

async function registerCommands(client, bot, token) {
    try {
        console.log('Started refreshing application (/) commands.');
        
        // Use bot.commands instead of client.commands
        const commands = [];
        const commandFiles = bot.commands || new Map();
        
        console.log(`Found ${commandFiles.size} commands to register`);
        
        for (const command of commandFiles.values()) {
            commands.push(command.data);
            console.log(`Preparing to register command: ${command.data.name}`);
        }

        const rest = new REST({ version: '10' }).setToken(token);
        
        // Get the first guild (server) the bot is in
        const guilds = Array.from(client.guilds.cache.values());
        if (guilds.length === 0) {
            console.error('Bot is not in any guilds!');
            return;
        }

        const guildId = guilds[0].id;
        console.log(`Registering ${commands.length} commands for guild: ${guildId}`);

        // Register commands for a specific guild (faster than global commands)
        const data = await rest.put(
            Routes.applicationGuildCommands(client.user.id, guildId),
            { body: commands }
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

module.exports = { registerCommands };