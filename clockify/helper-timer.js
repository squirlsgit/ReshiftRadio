const discord = require('../discord.js').ReshiftBot.Client;
const stop = require('./stop.js').stopTimer;
const timers = new discord.Collection("clockify-timers");

const getTimedOut = () => {
  const now = Date.now();
  return timers.keyArray().filter(userId => timers.get(userId) < now).splice();
}

const sendNote = (userId) => {
  
}

exports.addTimeout = (userId, endAt) => {
  timers.set(userId, endAt);
}
exports.removeTimeout = (userId) => {
  timers.delete(userId);
}

let tracker;

exports.init = () => {
  discord.setInterval(() => {
    const timedOut = getTimedOut();
    timedOut.forEach(userId => {
      stop(userId).then()

      sendNote(userId).then(user => console.log("Notified ", user.name, "Clockify timer stopped"));

      timers.delete(userId);
    });
  }, 60 * 1000);
}

exports.reset = () => {

}