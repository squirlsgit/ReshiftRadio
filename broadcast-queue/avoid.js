const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Adds song to queue',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    radio(message.guild.id).avoid = message.mentions.members.first();
    message.author.dmChannel.send("Now avoiding member " + radio(message.guild.id).avoid.displayName);
  },
};
