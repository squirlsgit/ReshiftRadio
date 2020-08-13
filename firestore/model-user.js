

class User {
  /**
   * @param {any} user json object representing custom configurations for user
   * @param {any} id id that matches discord userID and firestore id 1:1 relationship
   */
  constructor(user, id) {
    Object.assign(this, user);
    this.id = id;
  }
}
module.exports = { User };