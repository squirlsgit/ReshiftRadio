import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Adds song to queue',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    message.channel.send(`Can not play on ${(await radio.fetchBlackouts()).join(', ')}`);
  },
};
