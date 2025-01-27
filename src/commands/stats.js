const { EmbedBuilder } = require('discord.js');
const { formatHour, formatTimeCompact, getPeriodOfDay } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'stats',
        description: 'Show voice activity statistics',
        options: [
            {
                name: 'user',
                description: 'User to check stats for',
                type: 6,
                required: false
            }
        ]
    },
    async execute(interaction, bot) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const schedule = bot.db.getActivitySchedule(targetUser.id, interaction.guildId);
        
        // Create activity visualization using bar characters
        const maxValue = Math.max(...schedule.hourlyData.map(h => h.total_time));
        const barLength = 15; // Reduced bar length to accommodate time
        
        let activityGraph = '```\nHourly Activity (past 30 days):\n';
        for (let i = 0; i < 24; i++) {
            const hour = schedule.hourlyData.find(h => h.hour === i);
            const value = hour ? hour.total_time : 0;
            const bars = Math.round((value / maxValue) * barLength) || 0;
            const timeStr = formatTimeCompact(value).padEnd(12); // Use compact formatter
            activityGraph += `${formatHour(i).padStart(5)} |${'█'.repeat(bars)}${' '.repeat(barLength - bars)}| ${timeStr}\n`;
        }
        activityGraph += '```';

        // Create daily activity visualization
        let dailyGraph = '```\nDaily Activity:\n';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxDayValue = Math.max(...schedule.dailyData.map(d => d.total_time));
        
        for (let i = 0; i < 7; i++) {
            const day = schedule.dailyData.find(d => d.day_of_week === i);
            const value = day ? day.total_time : 0;
            const bars = Math.round((value / maxDayValue) * barLength) || 0;
            const timeStr = formatTimeCompact(value).padEnd(12); // Use compact formatter
            dailyGraph += `${days[i].padStart(3)} |${'█'.repeat(bars)}${' '.repeat(barLength - bars)}| ${timeStr}\n`;
        }
        dailyGraph += '```';

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Voice Activity Stats for ${targetUser.username}`)
            .addFields(
                { name: 'Most Active', value: schedule.mostActive, inline: true },
                { name: 'Peak Hours', value: schedule.peakHours, inline: true },
                { name: 'Least Active', value: schedule.leastActive, inline: true }
            )
            .setDescription(`${activityGraph}\n${dailyGraph}`);

        await interaction.reply({ embeds: [embed] });
    }
};