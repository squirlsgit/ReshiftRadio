const admin = require('firebase-admin');
const Bot = require('./reshift.js').default;
export class Guild {
  collection = "guilds";

  id;
  settings;

  constructor(id) {
    this.guildId = guildId;
    admin.firestore().collection(this.collection).doc(this.guildId).onSnapshot(guildref => {
      if (guildref.exists) {
        this.settings = guildref.data();
      } else {
        this.settings = null;
      }
    }, err => {
        this.settings = null;
    });

  }
}