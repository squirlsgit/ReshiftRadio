const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Clears out all songs from queue',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    if (radio(message.guild.id).station && radio(message.guild.id).broadcaster) {
      radio(message.guild.id).broadcaster.destroy();
    }

    radio(message.guild.id).queue.clear();
    
    message.channel.send("Stopped broadcast and cleared song queue. Channels that were being broadcasted on will be broadcasted on again upon adding a song.");

  },
};
