const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

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

    /**
     * @type {VoiceBroadcast}
     * */
    const res = await radio(message.guild.id).playBroadcast(message.member);
    if (res) {
      message.channel.send(`Starting broadcast`);

      res.on("end", () => {

        message.channel.send("Radio Stopped");
      });
    } else {
      message.channel.send("Radio failed to start.");
    }
    //res.on("subscribe", (stream) => console.log("Channel Added", stream.player.voiceConnection.channel.name));
    //res.on("end", () => )


  },
};
