const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js');

module.exports = {
  description: 'Fetches filters',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    message.channel.send(`Current Filters: ${radio.video_filters.keyArray().map(id => `${id} = ${radio.video.filters.get(id)}`).join(", ")}`);
  },
};
