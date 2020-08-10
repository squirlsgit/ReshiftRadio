var admin = require("firebase-admin");

var serviceAccount = require("src/environment/firebase-admin-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reshift-bot.firebaseio.com"
});