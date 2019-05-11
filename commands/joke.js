/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const request = require("request");

module.exports = class joke {
	constructor() {
		this.name = "joke",
		this.alias = [],
		this.usage = "/joke";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);
		/*
		if(data.lang === "fr") return sendE("Erreur 404: Aucun humour trouvé!");
		if(data.lang === "en") return sendE("Error 404: Humor module not found!");
		*/

		//TODO: User can save jokes in an general account, accessible on all servers

		if(data.lang === "fr") {
			request("https://bridge.buddyweb.fr/api/blagues/blagues", function(err, response, body) {
				if(err || response.statusCode != 200) {
					if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
					if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

					return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
				};

				let jokes = JSON.parse(body);
				let random = Math.floor(Math.random() * (jokes.length + 1));

				let joke = jokes[random].blagues;

				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					description: "**" + joke + "**"
				});

				message.channel.send(embed);
			});
		} else {
			if(data.lang === "en") {
				return sendE("Error 404: Humor module not found!");
			};
		};
	};
};