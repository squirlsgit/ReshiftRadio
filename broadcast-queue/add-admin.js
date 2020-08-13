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

    await Promise.all(dethrone_members.map(member => radio.addRadioAdmin(message.member, member)));

    message.channel.send("Removed Radio Host " + dethrone.map(member => member.displayName).join(', '));

  },
};
