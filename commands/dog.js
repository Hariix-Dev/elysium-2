/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");

const request = require("request");
const logger = require("../modules/logger");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const api = require("some-random-api");

module.exports = class dog {
	constructor() {
		this.name = "dog",
		this.alias = ["dogs"],
		this.en = "Give an image of an dog.",
		this.fr = "Donne une image d'un chien.",
		this.usage = "/dog";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);

		api.dogimg().then(img => {
			let hex = Math.floor(Math.random() * 16777215).toString(16);

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(hex),
				image: {
					url: "https://i.some-random-api.ml/" + img,
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