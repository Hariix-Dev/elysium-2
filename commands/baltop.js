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
		this.alias = ["lb", "baltop"],
		this.en = "Show the baltop of the server.",
		this.fr = "Montre le classement du serveur.",
		this.usage = "/leadersboard";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		Users.find({server_id: message.guild.id}, ["user_id", "money"], {
			limit: 20
		}).sort({money: -1}).exec((err, res) => {
			if(err) return log(err, "ERROR");

			let l = "";
			let pos = 1;

			res.forEach(element => {
				if(element.user_id === message.author.id) {
					l += ("__**" + pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.money + settings.currency + "**__,\n");
				} else {
					l += (pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.money + settings.currency + ",\n");
				};
				
				pos++;
			});

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.pistache),
				timestamp: Date.now(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.avatarURL
				},
				description: l
			});

			if(data.lang === "fr") embed.setAuthor("Leadersboard de " + message.guild.name, message.guild.iconURL);
			if(data.lang === "en") embed.setAuthor(message.guild.name + "'s leadersboard", message.guild.iconURL);

			message.channel.send(embed);
		});
	};
};