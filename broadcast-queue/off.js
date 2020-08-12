import { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } from 'discord.js';
const discord = require('discord.js');
const radio = require('./helper-radio.js').default;

module.exports = {
  description: 'Stops broadcasting to channel',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    voicechannels;

    const channel_name = args[0];


    let voicechannel = message.guild.channels.cache.find(channel => channel.name === channel_name && channel.type === 'voice');
    if (!voicechannel) voicechannel = message.member.voice.channel;

    if (!voicechannel) {
      message.channel.send(`Couldn't acquire channel ID. This is either cause the name does not exist or the channel is not the right type.`);
      return;
    }

    radio.removeRadioFrequency(voicechannel);
    message.channel.send(`No longer broadcasting on ${voicechannel.name}..`);

  },
};
