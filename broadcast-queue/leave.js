const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js');

module.exports = {
  description: 'Stops broadcasting to channel',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {


    if (radio(message.guild.id).currentConnection) {
      radio(message.guild.id).currentConnection.disconnect();
      radio(message.guild.id).channels.delete(radio(message.guild.id).currentConnection.channel.id);
      radio(message.guild.id).currentConnection = null;
      message.channel.send(`No longer broadcasting on ${voicechannel.name}..`);
    }

  },
};
