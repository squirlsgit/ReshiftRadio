const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js');

module.exports = {
  description: 'Broadcasts to channel',

  /**
   * 
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {


    const channel_name = args[0];

    console.log(channel_name)
    let voicechannel = message.guild.channels.cache.find(channel => channel.name === channel_name && channel.type === 'voice');
    if (!voicechannel) voicechannel = message.member.voice.channel;

    if (!voicechannel) {
      message.channel.send(`Couldn't acquire channel ID. This is either cause the name does not exist or the channel is not the right type.`);
      return;
    }

    radio.addRadioFrequency(voicechannel).then(_v => {
      if (_v) {
        message.channel.send(`Broadcasting on ${voicechannel.name}..`)
      } else {
        message.channel.send("Failed to connect");
      }
      
    });

  },
};
