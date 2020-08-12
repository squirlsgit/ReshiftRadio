const discord = require('discord.js');
const getUserSettings = require('../firestore/helper.js').getUserSettings;
const clock = require('./helper.js').clock;
const admin = require('firebase-admin');
module.exports = {
  description: 'Stops Clock for Message Board or Alias',
  async execute(message, ...args) {
    // if statement is for intellisense. kind of hacky but is useful.
    if (message instanceof discord.Message) {
      if (message.channel instanceof discord.TextChannel) {
        const channel = message.channel;
        const userId = message.author.id;

        // name of project id
        const alias = args[1];

        try {

          if (args[0] === 'add') {
            await admin.firestore().collection('users').doc(userId).update({ [`clockify_aliases.${channel}`]: alias })
          } else if (args[0] === 'remove') {
            await admin.firestore().collection('users').doc(userId).update({ [`clockify_aliases.${channel}`]: admin.firestore.FieldValue.delete() });
          }
          message.channel.send("Added Tracker");
        } catch (e) {
          message.channel.send("Failed to add Tracker: " + e.message);
        }
        

      }
    }
  },
};