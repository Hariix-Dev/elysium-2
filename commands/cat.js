/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");

const request = require("request");
const logger = require("../modules/logger");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

//API latency?
let url = "http://aws.random.cat/meow";

module.exports = class cat {
	constructor() {
		this.name = "cat",
		this.alias = [],
		this.usage = "/cat";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);

		let q = {
			url: url,
			json: false
		};

		let hex = Math.floor(Math.random() * 16777215).toString(16);

		request(q, function(err, response, body) {
			if(err || response.statusCode != 200) {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
				if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

				return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
			};

			let cat = JSON.parse(body);

			//.mp4 image is not supported now
			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(hex),
				image: {
					url: cat.file,
				}
			});

			message.channel.send(embed);
		});
	};
};