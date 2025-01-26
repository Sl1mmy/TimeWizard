const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'timespent',
        description: 'Check time spent in voice channels',
        options: [
            {
                name: 'period',
                description: 'Time period to check',
                type: 3, // STRING
                required: false,
                choices: [
                    { name: 'All Time', value: 'all' },
                    { name: 'Daily', value: 'daily' },
                    { name: 'Weekly', value: 'weekly' },
                    { name: 'Monthly', value: 'monthly' },
                    { name: 'Yearly', value: 'yearly' }
                ]
            },
            {
                name: 'user',
                description: 'User to check time for',
                type: 6, // USER
                required: false
            }
        ]
    },
    async execute(interaction, bot) {
        const period = interaction.options.getString('period') || 'all';
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const timeSpent = bot.db.getUserVoiceTime(targetUser.id, interaction.guildId, period);
        
        const periodText = period === 'all' ? 'total' : period;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${periodText.charAt(0).toUpperCase() + periodText.slice(1)} Voice Channel Time`)
            .setDescription(`${targetUser.id === interaction.user.id ? 'You' : targetUser.username} have spent ${formatTime(timeSpent)} in voice channels${period !== 'all' ? ` in the last ${period === 'daily' ? 'day' : period.slice(0, -2)}` : ''}.`);
        
        await interaction.reply({ embeds: [embed] });
    }
};