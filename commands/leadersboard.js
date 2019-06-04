/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Users = require("../models/users");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

module.exports = class leadersboard {
	constructor() {
		this.name = "leadersboard",
		this.alias = ["lb"],
		this.usage = "/leadersboard";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		Users.find({}, ["user_id", "money"], {
			limit: 10
		}).sort({money: -1}).exec((err, res) => {
			if(err) return log(err, "ERROR");

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.pistache),
				timestamp: Date.now(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.avatarURL
				}
			});

			if(data.lang === "fr") embed.setAuthor("Leadersboard de " + message.guild.name, message.guild.iconURL);
			if(data.lang === "en") embed.setAuthor(message.guild.name + "'s leadersboard", message.guild.iconURL);

			message.channel.send(embed);
		});
	};
};