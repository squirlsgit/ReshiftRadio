const Guild = require('../guild.js');
const Discord = require('discord.js');
module.exports = {
  description: 'log options <subscribe|unsubscribe>',

  /**
   * 
   * @param {Discord.Message} message
   * @param {...string[]} args
   */
  async execute(message, ...args) {

    if (!Guild.Actives.has(message.guild.id) || message.channel.type !== 'text' || !message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send("Could not subscribe to log. Guild is not being tracked.");
      return;
    }

    if (args[0] === 'subscribe') {
      Guild.Actives.get(message.guild.id).debugToChannel = message.channel;
      message.channel.send("Subscribed to log. Please visit this thread to keep posted. Only one subscription of this type can be active per server.");

    } else if (args[0] === 'unsubscribe') {
      Guild.Actives.get(message.guild.id).debugToChannel = null;
      message.channel.send("Unsubscribed to log. This channel will no longer receive updates.");

    }
    
  },
};
