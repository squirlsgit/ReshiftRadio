const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js');

module.exports = {
  description: 'Remove host',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const dethrone_members = message.mentions.members.array();

    dethrone_members.forEach(member => radio(message.guild.id).deplatform(message.member, member));

    message.channel.send("Disenfranchised " + dethrone_members.map(member => member.displayName).join(', '));

  },
};
