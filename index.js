const Discord = require('discord.js');
const { prefix, token } = require('./environment/bot-config.json');

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});
