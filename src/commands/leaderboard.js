const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'Show voice time leaderboard',
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
            }
        ]
    },
    async execute(interaction, bot) {
        const period = interaction.options.getString('period') || 'all';
        const leaderboardData = bot.db.getLeaderboard(interaction.guildId, period);
        const periodText = period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1);
        
        let description = '';
        for (let i = 0; i < leaderboardData.length; i++) {
            const user = leaderboardData[i];
            let member = interaction.guild.members.cache.get(user.user_id);
            
            // If member not in cache, try to fetch them
            if (!member) {
                try {
                    member = await interaction.guild.members.fetch(user.user_id);
                } catch (error) {
                    console.error(`Could not fetch member ${user.user_id}:`, error);
                }
            }

            // If still no member, try to fetch user from client
            let username = 'Unknown User';
            if (member) {
                username = member.displayName;
            } else {
                try {
                    const fetchedUser = await bot.client.users.fetch(user.user_id);
                    username = fetchedUser.username;
                } catch (error) {
                    console.error(`Could not fetch user ${user.user_id}:`, error);
                }
            }

            description += `${i + 1}. **${username}** - ${formatTime(user.total_time)}\n`;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${periodText} Voice Time Leaderboard`)
            .setDescription(description || 'No data available');

        await interaction.reply({ embeds: [embed] });
    }
};