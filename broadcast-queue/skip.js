const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Skips song',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    radio(message.guild.id).skipSong(message.member);
    message.channel.send(`Skipped song`);

  },
};
