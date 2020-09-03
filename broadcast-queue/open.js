const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Starts broadcast',

  /**
   * @param {Message} message
   * @param {...any} args
   */
  async execute(message, ...args) {

    channels = args.map(voice_channel_name => {
      return message.guild.channels.cache.find(channel => channel.name === voice_channel_name && channel.type === 'voice');
    });


    console.log("guild id", message.guild.id);
    /**
     * @type {VoiceBroadcast}
     * */
    const res = await radio(message.guild.id).openRadioStation(message.member, ...channels);
    if (res) {
      message.channel.send(`Opened station`);

      res.on("end", () => {

        message.channel.send("Radio Shutting Down");
      });
    } else {
      message.channel.send("Could not open station");
    }
    //res.on("subscribe", (stream) => console.log("Channel Added", stream.player.voiceConnection.channel.name));
    //res.on("end", () => )
    

  },
};
