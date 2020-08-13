var admin = require("firebase-admin");

const collections = require('./collections.js');
const { User } = require ('./model-user');

var serviceAccount = require("../environment/firebase-admin-key.json");

exports.init = () => {
  console.log("initializing");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reshift-bot.firebaseio.com"
  });
}
exports.getUserSettings = async (userID) => {
  const userref = await admin.firestore().collection(collections.users).doc(userID).get();
  
  return new User(userref.data(), userref.id);
}

