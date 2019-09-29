/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");

const logger = require("../modules/logger");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const api = require("some-random-api");

module.exports = class cat {
	constructor() {
		this.name = "cat",
		this.alias = ["cats"],
		this.en = "Get an image of an cat.",
		this.fr = "Donne une image d'un chat.",
		this.usage = "/cat";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);

		api.catimg().then(img => {
			let hex = Math.floor(Math.random() * 16777215).toString(16);

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(hex),
				image: {
					url: img
				}
			});

			message.channel.send(embed);
		}).catch(err => {
			if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
			if(data.lang === "en") sendE("An error occurred, try again later...");

			return log(err, "ERROR");
		});
	};
};