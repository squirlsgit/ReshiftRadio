const admin = require('firebase-admin');
const Bot = require('./reshift.js').default;
const events = require('events');
const logger = require('./tooltips/helper-log.js').logger;
const Discord = require('discord.js');
class Guild {
  /**
   * @type {Discord.Collection<string, Guild>}
   */
  static Actives = new Discord.Collection();
  collection = "guilds";
  logger = logger;
  id;
  /**
   * @type {{video_length: number, broadcastable_on: string[], hosts: {[userId:string]: boolean}, restrict_broadcast: boolean, volume: number}}
   */
  settings;
  /**
   * @type {events.EventEmitter}
   */
  $settings = new events.EventEmitter();

  /**
   * @type {Discord.TextChannel}
   */
  debugToChannel;

  constructor(id) {
    this.id = id;
    // Subscribe to setting updates
    admin.firestore().collection(this.collection).doc(this.id).onSnapshot(guildref => {
      if (guildref.exists) {
        this.settings = guildref.data();
        this.logger.info(this.id, this.settings);
      } else {
        this.settings = null;
      }
      console.log(this.$settings.listenerCount('update'));
      if (this.$settings.listeners('update')) {
        this.$settings.emit('update', this.settings);
      }
      
    }, err => {
        this.settings = null;
        return err;
    });

    // Subscribe to logs
    this.logger.on('error', (err) => {
      if (this.debugToChannel) {
        this.debugToChannel.send(`Bot Error: ${err.message}`,{split: true})
      }
    })
    this.logger.on('finish', (info) => {
      if (this.debugToChannel) {
        this.debugToChannel.send(`${info}`, { split: true });
      }
    });

    Guild.Actives.set(id, this);

  }
  isHost(userID) {
    return this.settings && this.settings.hosts && this.settings.hosts[userID];
  }

  addHost(userID) {
    return admin.firestore().collection(this.collection).doc(this.id).update({[`hosts.${userID}`]: true});
  }
  removeHost(userID) {
    return admin.firestore().collection(this.collection).doc(this.id).update({ [`hosts.${userID}`]: false });
  }
  setDefaultVolume(volume) {
    return admin.firestore().collection(this.collection).doc(this.id).update({ [`volume`]: typeof volume === 'string'? parseFloat(volume): volume });
  }
  addBroadcastableTag(tag) {
    return admin.firestore().collection(this.collection).doc(this.id).update({ broadcastable_on: admin.firestore.FieldValue.arrayUnion(tag) });
  }
  removeBroadcastableTag(tag) {
    return admin.firestore().collection(this.collection).doc(this.id).update({ broadcastable_on: admin.firestore.FieldValue.arrayRemove(tag) });
  }

  saveSettings(settings_partial) {
    return admin.firestore().collection(this.collection).doc(this.id).set(settings_partial, { merge: true });
  }


  //logs

}
module.exports = Guild;