const { Client, GatewayIntentBits } = require('discord.js');
const Database = require('./database/database');
const TimeTracker = require('./services/timeTracker');
const { registerCommands } = require('./utils/commandRegister');
const { loadEvents } = require('./utils/eventLoader');
const { loadCommands } = require('./utils/commandLoader');

class VoiceTimeTracker {
    constructor() {
        this.client = new Client({ 
            intents: [
                GatewayIntentBits.Guilds, 
                GatewayIntentBits.GuildMessages, 
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildVoiceStates
            ] 
        });

        this.db = new Database();
        this.timeTracker = new TimeTracker(this.client, this.db);
    }

    async login(token) {
        try {
            // Load commands first
            loadCommands(this);
            
            // Then load events
            loadEvents(this.client, this);
            
            // Login
            await this.client.login(token);
            
            // Wait for client to be ready
            await new Promise(resolve => {
                if (this.client.isReady()) resolve();
                else this.client.once('ready', () => resolve());
            });
            
            // Register commands
            await registerCommands(this.client, this, token);
            
            this.timeTracker.startPeriodicUpdates();
            
            console.log(`Logged in as ${this.client.user.tag}!`);
        } catch (error) {
            console.error('Error during login:', error);
        }
    }
}

module.exports = VoiceTimeTracker;