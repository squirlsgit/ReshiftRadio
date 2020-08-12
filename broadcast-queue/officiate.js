import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Adds radio host',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const throne_members = message.mentions.members.array();

    radio.addRadioHosts(message.author, message.member, ...throne_members);

    message.channel.send("Platformed " + throne_members.map(member => member.displayName).join(', '));

  },
};
