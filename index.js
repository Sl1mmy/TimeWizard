const VoiceTimeTracker = require('./src/bot');
const { token } = require('./config.json');

const bot = new VoiceTimeTracker();
bot.login(token);