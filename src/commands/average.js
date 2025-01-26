const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'average',
        description: 'Check average time spent in voice channels',
        options: [
            {
                name: 'period',
                description: 'Time period to check average for',
                type: 3, // STRING
                required: true,
                choices: [
                    { name: 'Daily Average', value: 'daily' },
                    { name: 'Weekly Average', value: 'weekly' },
                    { name: 'Monthly Average', value: 'monthly' },
                    { name: 'Yearly Average', value: 'yearly' }
                ]
            },
            {
                name: 'user',
                description: 'User to check average time for',
                type: 6, // USER
                required: false
            }
        ]
    },
    async execute(interaction, bot) {
        const period = interaction.options.getString('period');
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const averageTime = bot.db.getUserAverageTime(targetUser.id, interaction.guildId, period);
        
        const periodText = {
            'daily': 'day',
            'weekly': 'week',
            'monthly': 'month',
            'yearly': 'year'
        }[period];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Average Voice Time`)
            .setDescription(`${targetUser.id === interaction.user.id ? 'You spend' : `${targetUser.username} spends`} an average of ${formatTime(averageTime)} per ${periodText} in voice channels.`);
        
        await interaction.reply({ embeds: [embed] });
    }
};
