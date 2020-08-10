const Discord = require('discord.js');

export class ReshiftBot {

  static Client = new Discord.Client();
  
  static Init(token) {
    ReshiftBot.Client.on('ready', () => console.log('Ready!'));
    ReshiftBot.Client.login(token);
  }

}