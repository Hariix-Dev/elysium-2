/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const api = require("some-random-api");

module.exports = class redpanda {
	constructor() {
		this.name = "redpanda",
		this.alias = [],
		this.usage = "/redpanda";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		api.redpandaimg().then(img => {
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