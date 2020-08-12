import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Starts broadcast',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    channels = args.map(voice_channel_name => {
      return message.guild.channels.cache.find(channel => channel.name === voice_channel_name && channel.type === 'voice');
    });

    const res = radio.broadcast(message.member, ...channels);
    if (res) {
      message.channel.send(`Starting broadcast`);
    } else {
      message.channel.send("Could not start broadcast");
    }

  },
};
