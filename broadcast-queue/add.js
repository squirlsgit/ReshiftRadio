const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Adds song to queue',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const link = args[0];
    const volume = args[1];
    const repeat = args[2];
    if (args.includes('--playlist')) {
      radio(message.guild.id).enqueuYoutubePlaylist(message.member, link, { volume, repeat })

    } else {

      radio(message.guild.id).enqueueYoutubeSong(message.member, link, { volume, repeat });
    }
    
  },
};
