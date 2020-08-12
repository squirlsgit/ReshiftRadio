
const discord = require('discord.js');
const getUserSettings = require('../firestore/helper.js').getUserSettings;
const clock = require('./helper.js').clock;



module.exports = {
  description: 'Starts Clock for Message Board or Alias',

  async execute(message, ...args) {
    // if statement is for intellisense. kind of hacky but is useful.
    if (message instanceof discord.Message) {
      if (message.channel instanceof discord.TextChannel) {
        const channel = message.channel;
        const userId = message.author.id;
        const settings = await getUserSettings(userId);

        const apikey = ettings.clockify_key;
        const alias = settings.clockify_aliases[channel];

        clock.post('time-entries', { projectId: projectId, description: args[0] }, { headers: { 'X-Api-Key': apikey } }).then(res => {
          console.log(res);
          message.author.send('Started to track time');
        }).catch(err => {
          message.author.send('Failed to track time. ' + err.message);
        })

      }
    }
  },
};
