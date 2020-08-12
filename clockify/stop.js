const discord = require('discord.js');
const getUserSettings = require('../firestore/helper.js').getUserSettings;
const clock = require('./helper.js').clock;
const stopTimer = (userId) => {
  const settings = await getUserSettings(userId);

  const apikey = settings.clockify_key;
  //const projectId = settings.clockify_aliases[channel]; //5ddbf540b3bc842d7a198d3f - gitlab/support 5dc0516c26e5c3254a3eabdc - clientId for Dogtopia
  const clockifyUserId = settings.clockify_userid;
  return clock.patch(`user/${clockifyUserId}/time-entries`, { end: new Date() }, { headers: { 'X-Api-Key': apikey } }).then(res => {
    console.log(res);
    message.author.send('Started to track time');
  }).catch(err => {
    message.author.send('Failed to track time. ' + err.message);
  });
}
module.exports = {
  description: 'Stops Clock for Message Board or Alias',
  stopTimer: stopTimer,
  async execute(message, ...args) {
    // if statement is for intellisense. kind of hacky but is useful.
    if (message instanceof discord.Message) {
      if (message.channel instanceof discord.TextChannel) {
        //const channel = message.channel;
        const userId = message.author.id;
        return stopTimer(userId);

      }
    }
  },
};