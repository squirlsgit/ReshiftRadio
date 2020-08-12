
const Bot = require('./reshift.js').default;
const prefixMap = {};

// Init Commands
Bot.getPrompts('commands', 'commands');

// Init Prompt Commands - Specific to Prompt Library
Bot.getPrompts('prompts', 'commands', 'user-bot');

// Init Clockify Integration
Bot.getPrompts('clock', 'clockify');


require('firestore/helper.js').init();

Bot.init();


Bot.Client.on('message', message => {
	for (prefix in prefixMap) {
		if (!message.content.startsWith(prefix) || message.author.bot) continue;

		const protocolCollection = Bot.getPrefixCollection(prefix);

		const args = message.content.slice(prefix.length).trim().split(/ +/);

		const command = args.shift().toLowerCase();
		if (!protocolCollection.has(command)) return;

		try {
			protocolCollection.get(command).execute(message, args);
		} catch (error) {
			console.error(error);
			message.reply('there was an error trying to execute that command!');
		}


	}

});


/**
 *
 * @TODO setup sql connection
 */
