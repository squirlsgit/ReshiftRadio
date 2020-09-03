const { Channel, User, GuildMember, BroadcastDispatcher, StreamDispatcher, VoiceBroadcast, Message, VoiceChannel, VoiceConnection, Collection } = require('discord.js');
const discord = require('discord.js');
const radio = require('./helper-radio.js').radio;

module.exports = {
  description: 'Applies filters to songs',

  /**
   * 
   * @param {Message} message
   * @param {...string} args
   */
  async execute(message, ...args) {
    let donotfilter = false;
    const apply = args.map(async arg => {
      let preformat = arg.split('=');
      if (preformat.length > 2) {
        donotfilter = true;
        return null;
      }
      return { [preformat[0]]: preformat[1] };

    });
    if (donotfilter) {
      message.channel.send("Invalid Query. Format arguments as so: ...{<filter_name>=<filter_value>}");
    }
    

    apply.forEach(filter => {
      radio(message.guild.id).addVideoFilter(`${message.member.displayName}-${Object.keys(filter)[0]}`, filter);
    });

    message.channel.send(`Current Filters: ${radio(message.guild.id).video_filters.keyArray().map(id => `${id} = ${radio(message.guild.id).video.filters.get(id)}`).join(", ")}`);

  },
};
