const Discord = require('discord.js');
const { prefix, token } = require('./environment/bot-config.json');

const client = new Discord.Client();

//#region Initializes Protocols
function getEntityPath(name, ...dir) {
	return `${dir.join('/')}${dir.length > 0? '/': ''}${name}`;
}
function getPrompts(collection, name, ...dir) {
	if (!client[collection]) {
		client[collection] = new Discord.Collection();
	}
	const stats = fs.lstatSync(getEntityPath(name, dir));
	if (stats.isFile() && name.endsWith('.js') && !name.startsWith('helper') && !name.startsWith('model') && !name.startsWith('component')) {
		const protocol = require(getEntityPath(name, dir));
		client[collection].set(getEntityPath(name, dir), protocol)
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
// Init Prompt Listeners - General version of commands.
getPrompts('prompts', 'listeners', 'user-bot');


/**
 * @TODO setup firestore init
 * @TODO setup sql connection
 */

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;

	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}

})

// login to Discord with your app's token
client.login(token);