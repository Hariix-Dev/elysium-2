/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const request = require("request");

module.exports = class fox {
	constructor() {
		this.name = "fox",
		this.alias = [],
		this.usage = "/fox";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		request("https://some-random-api.ml/img/fox", function(err, response, body) {
			if(err || response.statusCode != 200) {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
				if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

				return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
			};

			let hex = Math.floor(Math.random() * 16777215).toString(16);

			let image = JSON.parse(body);

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(hex),
				image: {
					url: image.link
				}
			});

			message.channel.send(embed);
		});
	};
};