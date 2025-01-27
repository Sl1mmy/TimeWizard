const { EmbedBuilder } = require('discord.js');
const { formatHour, formatTimeCompact, getPeriodOfDay } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'serverstats',
        description: 'Show server-wide voice activity statistics',
    },
    async execute(interaction, bot) {
        const schedule = bot.db.getServerActivitySchedule(interaction.guildId);
        
        // Create activity visualization using bar characters
        const maxValue = Math.max(...schedule.hourlyData.map(h => h.total_time));
        const barLength = 15;
        
        let activityGraph = '```\nServer Hourly Activity (past 30 days):\n';
        for (let i = 0; i < 24; i++) {
            const hour = schedule.hourlyData.find(h => h.hour === i);
            const value = hour ? hour.total_time : 0;
            const users = hour ? hour.unique_users : 0;
            const bars = Math.round((value / maxValue) * barLength) || 0;
            const timeStr = formatTimeCompact(value).padEnd(12);
            activityGraph += `${formatHour(i).padStart(5)} |${'█'.repeat(bars)}${' '.repeat(barLength - bars)}| ${timeStr} (${users} users)\n`;
        }
        activityGraph += '```';

        // Create daily activity visualization
        let dailyGraph = '```\nServer Daily Activity:\n';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxDayValue = Math.max(...schedule.dailyData.map(d => d.total_time));
        
        for (let i = 0; i < 7; i++) {
            const day = schedule.dailyData.find(d => d.day_of_week === i);
            const value = day ? day.total_time : 0;
            const users = day ? day.unique_users : 0;
            const bars = Math.round((value / maxDayValue) * barLength) || 0;
            const timeStr = formatTimeCompact(value).padEnd(12);
            dailyGraph += `${days[i].padStart(3)} |${'█'.repeat(bars)}${' '.repeat(barLength - bars)}| ${timeStr} (${users} users)\n`;
        }
        dailyGraph += '```';

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Voice Activity Stats for ${interaction.guild.name}`)
            .addFields(
                { name: 'Most Active Time', value: schedule.peakHours, inline: true },
                { name: 'Most Active Day', value: schedule.mostActive, inline: true },
                { name: 'Total Users', value: schedule.totalUsers.toString(), inline: true },
                { name: 'Average Daily Users', value: schedule.avgDailyUsers.toString(), inline: true },
                { name: 'Total Time', value: formatTimeCompact(schedule.totalTime), inline: true }
            )
            .setDescription(`${activityGraph}\n${dailyGraph}`);

        await interaction.reply({ embeds: [embed] });
    }
};