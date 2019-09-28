/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030 */
const api = require("some-random-api");

//get the bot token
//don't use this command plz!

module.exports = class token {
	constructor() {
		this.name = "token",
		this.alias = ["secret"],
		this.en = "Don't use that.",
		this.fr = "Ne pas utiliser.",
		this.usage = "/token";
	};

	run(bot, message, args, data, settings, db) {
		api.bottoken().then(token => {
			message.channel.send(":warning: ||" + token + "|| :warning:");
		}).catch();
	};
};