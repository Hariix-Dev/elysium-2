/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");

module.exports = class roll {
	constructor() {
		this.name = "roll",
		this.alias = [],
		this.usage = "/roll";
	};

	run(bot, message, args, data, settings, db) {
		let hex = Math.floor(Math.random() * 16777215).toString(16);

		let roll = Math.floor(Math.random() * 6) + 1;

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(hex),
			title: roll
		});

		message.channel.send(embed);
	};
};