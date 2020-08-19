const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js');

module.exports = {
  description: 'Adds radio host',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const throne_members = message.mentions.members.array();
    radio(message.guild.id).addRadioHosts(message.member, false, ...throne_members);

    message.channel.send("Platformed " + throne_members.map(member => member.displayName).join(', '));

  },
};
