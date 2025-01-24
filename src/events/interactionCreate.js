module.exports = {
    name: 'interactionCreate',
    async execute(interaction, bot) {
        if (!interaction.isCommand()) return;

        const command = bot.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, bot);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error executing this command!', 
                ephemeral: true 
            });
        }
    }
};