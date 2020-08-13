
const Bot = require('./reshift.js').default;
const prefixMap = {};

const firebaseinit = require('./firestore/helper.js').init;
firebaseinit();
// Init Commands
Bot.getPrompts('commands', 'commands');

// Init Prompt Commands - Specific to Prompt Library
Bot.getPrompts('prompts', 'commands', 'user-bot');

// Init Clockify Integration
Bot.getPrompts('clock', 'clockify');

// Init Broadcast

Bot.getPrompts('broadcast', 'broadcast-queue');

Bot.init();


Bot.Client.on('message', message => {
	console.log(message.content);
	for (prefix in Bot.prefixMap) {
		if (!message.content.startsWith(prefix) || message.author.bot) continue;

		const protocolCollection = Bot.getPrefixCollection(prefix);

		const args = message.content.slice(prefix.length).trim().split(/ +/);

		const command = args.shift().toLowerCase();
		if (!protocolCollection.has(command)) {
			message.channel.send(`Available commands: ${protocolCollection.keyArray().map(prompt => `${prompt}: ${protocolCollection.get(prompt).description}`).join('\n')}`);
			return;
		}

		try {
			protocolCollection.get(command).execute(message, ...args);
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
