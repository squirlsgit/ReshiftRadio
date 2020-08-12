import { Collection } from 'discord.js';
const Discord = require('discord.js');
const { prefix, token } = require('./environment/bot-config.json');

class Reshift {


	Client = new Discord.Client();

	constructor() {
	}


	/**
	 * Logs Bot into Discord
	 * @returns {void} 
	 **/
  init() {
    this.Client.on('ready', () => console.log('Ready!'));
    this.Client.login(token);
  }

  //#region Initializes Protocols

	getEntityPath(name, ...dir) {

		return `${dir.join('/')}${dir.length > 0 ? '/' : ''}${name}`;

	}

	prefixMap = {};

	/**
	 * 
	 * @param {any} prefix
	 * @returns {Collection}
	 */
	getPrefixCollection(prefix) {
		if (this.Client[this.prefixMap[prefix]] instanceof Discord.Collection) return this.Client[this.prefixmap[prefix]];
		else return null;
	}

	/**
	 * 
	 * @param {any} collection
	 * @returns {Collection}
	 */
	getCollection(collection) {
		if (this.Client[collection] instanceof Discord.Collection) return this.Client[collection]
		else return null;
	}

	/**
	 * 
	 * Reads every subdirectory or file belonging to or at ..dir/name
	 * Sets a collection referencing the exported modules in gathered files.
	 * The collection can be referenced with <Reshift>.Client[<'!{environment:prefix}-{collection}'>]
	 * Stores the conversion of !{environment:prefix}-{collection} to {collection} seperately in prefixMap
	 * @param {string} collection
	 * @param {string} name
	 * @param {...string} dir
	 */
	getPrompts(collection, name, ...dir) {

		if (!this.getCollection(collection)) {
			this.Client[collection] = new Discord.Collection();
			this.prefixMap[`${prefix}-${collection}`] = collection;
		}

		const stats = fs.lstatSync(getEntityPath(name, dir));
		if (stats.isFile() && name.endsWith('.js') && !name.startsWith('helper') && !name.startsWith('model') && !name.startsWith('component')) {

			const protocol = require(getEntityPath(name, dir));
			this.Client[collection].set(protocol.name || getEntityPath(name, dir).slice(0, -3), protocol); // e.g. !reshift-bot user-bot/ghali/helloworld

		} else if (stats.isDirectory()) {
			const docs = fs.readdirSync(getEntityPath(name, ...dir));

			for (file of docs) {
				getPrompts(collection, file, dir.concat(name));
			}
		}

	}

//#endregion


}

const Bot = new Reshift();
export default Bot