import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Remove host',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const dethrone_members = message.mentions.members.array();

    dethrone_members.forEach(member => radio.removeHost(member));

    message.channel.send("Disenfranchised " + dethrone_members.map(member => member.displayName).join(', '));

  },
};
