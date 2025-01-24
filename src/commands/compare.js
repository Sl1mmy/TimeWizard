const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/timeFormatter');

module.exports = {
    data: {
        name: 'compare',
        description: 'Compare voice time between two users',
        options: [
            {
                name: 'user1',
                description: 'First user to compare',
                type: 6, // USER
                required: true
            },
            {
                name: 'user2',
                description: 'Second user to compare',
                type: 6, // USER
                required: true
            }
        ]
    },
    async execute(interaction, bot) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');
        const time1 = bot.db.getUserVoiceTime(user1.id, interaction.guildId);
        const time2 = bot.db.getUserVoiceTime(user2.id, interaction.guildId);
        const difference = Math.abs(time1 - time2);
        
        let description;
        if (time1 > time2) {
            description = `${user1.username} has spent ${formatTime(difference)} more time in voice channels than ${user2.username}`;
        } else if (time2 > time1) {
            description = `${user2.username} has spent ${formatTime(difference)} more time in voice channels than ${user1.username}`;
        } else {
            description = `Both users have spent the same amount of time in voice channels: ${formatTime(time1)}`;
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Voice Time Comparison')
            .addFields(
                { name: user1.username, value: formatTime(time1), inline: true },
                { name: user2.username, value: formatTime(time2), inline: true }
            )
            .setDescription(description);

        await interaction.reply({ embeds: [embed] });
    }
};