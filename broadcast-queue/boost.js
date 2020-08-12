import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Enable channel',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    const channel_name = args[0];
    let voicechannel = message.guild.channels.cache.find(channel => channel.name === channel_name && channel.type === 'voice');
    if (!voicechannel) voicechannel = message.member.voice.channel;

    if (!voicechannel) {
      message.channel.send("Couldn't acquire channel ID. This is either cause the name does not exist or the channel is not the right type.");
      return;
    }

    radio.whiteout(voicechannel).then(() => message.channel.send(`Radio is enabled on ${voicechannel.name}`).catch(err => message.channel.send(`Could not enable radio on ${voicechannel.name} because ${err.message}`));


  },
};
