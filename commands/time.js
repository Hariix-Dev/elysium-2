/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const moment = require("moment");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");

module.exports = class time {
	constructor() {
		this.name = "time",
		this.alias = ["t", "date", "d"],
		this.en = "Give the time in fr or en.",
		this.fr = "Donne l'heure en France ou en Amerique.",
		this.usage = "/time";
	};

	run(bot, message, args, data, settings, db) {
		moment.locale(data.lang);

		let time = moment().format("Do MMMM YYYY, HH:mm:ss");

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.amazingBlue),
			title: ":clock1: " + time
		});

		message.channel.send(embed);
	};
};