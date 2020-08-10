const Discord = require('discord.js');
const { prefix, token } = require('./environment/bot-config.json');

const bot = require('./discord.js').ReshiftBot;
bot.Init(token);
const client = bot.Client;
const prefixMap = {};

//#region Initializes Protocols
function getEntityPath(name, ...dir) {
	return `${dir.join('/')}${dir.length > 0? '/': ''}${name}`;
}
function getPrompts(collection, name, ...dir) {
	if (!client[collection]) {
		client[collection] = new Discord.Collection();
		prefixMap[`${prefix}-${collection}`] = collection;
	}
	const stats = fs.lstatSync(getEntityPath(name, dir));
	if (stats.isFile() && name.endsWith('.js') && !name.startsWith('helper') && !name.startsWith('model') && !name.startsWith('component')) {
		const protocol = require(getEntityPath(name, dir));
		client[collection].set(protocol.name || getEntityPath(name, dir).slice(0, -3), protocol);
	} else if (stats.isDirectory()) {
		const docs = fs.readdirSync(getEntityPath(name, ...dir));
		for (file of docs) {
			getPrompts(collection, file, dir.concat(name));
		}
	}

}
//#endregion

// Init Commands
getPrompts('commands', 'commands');

// Init Prompt Commands - Specific to Prompt Library
getPrompts('prompts', 'commands', 'user-bot');

// Init Clockify Integration
getPrompts('clock', 'clockify');


require('firestore/helper.js').init();

/**
 * 
 * @TODO setup sql connection
 */

client.on('message', message => {
	for (prefix in prefixMap) {
		if (!message.content.startsWith(prefix) || message.author.bot) continue;

		const protocolCollection = client[prefixMap[prefix]];

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
	
})
