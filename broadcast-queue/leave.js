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


    if (radio.currentConnection) {
      radio.currentConnection.disconnect();
      radio.channels.delete(radio.currentConnection.channel.id);
      radio.currentConnection = null;
      message.channel.send(`No longer broadcasting on ${voicechannel.name}..`);
    }

  },
};
