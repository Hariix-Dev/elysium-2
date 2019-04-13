/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const request = require("request");

//get the bot token
//don't use this command plz!

module.exports = class token {
	constructor() {
		this.name = "token",
		this.alias = ["secret"],
		this.usage = "/token";
	};

	run(bot, message, args, data, settings, db) {
		let link = "https://some-random-api.ml/bottoken";

		request(link, function(err, response, body) {
			if(err || response.statusCode != 200) return;

			let token = JSON.parse(body).token;

			message.channel.send(":warning: ||" + token + "|| :warning:");
		});
	};
};