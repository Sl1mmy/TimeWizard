const fs = require('fs');
const path = require('path');

function loadEvents(client, bot) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, bot));
        } else {
            client.on(event.name, (...args) => event.execute(...args, bot));
        }
    }
}

module.exports = { loadEvents };