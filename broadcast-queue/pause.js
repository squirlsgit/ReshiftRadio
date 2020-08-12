import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Pauses broadcast',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    radio.pauseBroadcast(message.member);
    message.channel.send(`Paused broadcast`);

  },
};
