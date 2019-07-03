/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const fetch = require("node-fetch");
const logger = require("../modules/logger");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

module.exports = class yesorno {
	constructor() {
		this.name = "yesorno",
		this.alias = ["yon"],
		this.usage = "/yesorno";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		fetch("https://yesno.wtf/api").then(res => res.json().then(data => {
			const embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.purple),
				title: data.answer.toUpperCase(),
				image: {
					url: data.image
				}
			});

			message.channel.send(embed);
		})).catch(err => log(err, "ERROR"));
	};
};