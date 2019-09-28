/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Users = require("../models/users");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

module.exports = class rank {
	constructor() {
		this.name = "rank",
		this.alias = [],
		this.en = "Show rank of XP, msg or chars.",
		this.fr = "Donne le classement d'xp, messages ou de caractères.",
		this.usage = "/rank [type: xp, messages, caracters]";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.pistache),
			timestamp: Date.now(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.avatarURL
			}
		});

		let columns;

		switch(args[1]) {
			case "xp":
				if(data.lang === "fr") embed.setAuthor("Classement d'XP " + message.guild.name, message.guild.iconURL);
				if(data.lang === "en") embed.setAuthor(message.guild.name + "'s XP leadersboard", message.guild.iconURL);

				columns = ["user_id", "xp", "level"];
			break;

			case "messages":
				if(data.lang === "fr") embed.setAuthor("Classement des message sur " + message.guild.name, message.guild.iconURL);
				if(data.lang === "en") embed.setAuthor(message.guild.name + "'s messages leadersboard", message.guild.iconURL);

				columns = ["user_id", "messages"];
			break;

			case "caracters":
				if(data.lang === "fr") embed.setAuthor("Classement des caractères sur " + message.guild.name, message.guild.iconURL);
				if(data.lang === "en") embed.setAuthor(message.guild.name + "'s caracters leadersboard", message.guild.iconURL);

				columns = ["user_id", "caracters"];
			break;
		
			default:
				if(data.lang === "fr") embed.setAuthor("Classement d'XP " + message.guild.name, message.guild.iconURL);
				if(data.lang === "en") embed.setAuthor(message.guild.name + "'s XP leadersboard", message.guild.iconURL);

				columns = ["user_id", "xp", "level"];
			break;
		};

		Users.find({server_id: message.guild.id}, columns, {
			limit: 20
		}).sort({level: -1}).exec((err, res) => {
			if(err) return log(err, "ERROR");

			let l = "";
			let pos = 1;

			if(args[1] === "xp") {
				res.forEach(element => {
					if(element.user_id === message.author.id) {
						l += ("__**" + pos.toString() + ". " + message.guild.members.get(element.user_id) + ": lvl." + element.level + " - " + element.xp + "xp**__,\n");
					} else {
						l += (pos.toString() + ". " + message.guild.members.get(element.user_id) + ": lvl." + element.level + " - " + element.xp + "xp,\n");
					};
					
					pos++;
				});
			} else {
				if(args[1] === "messages") {
					res.forEach(element => {
						if(element.user_id === message.author.id) {
							l += ("__**" + pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.messages + " messages**__,\n");
						} else {
							l += (pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.messages + " messages,\n");
						};
						
						pos++;
					});
				} else {
					if(args[1] === "caracters") {
						res.forEach(element => {
							if(element.user_id === message.author.id) {
								l += ("__**" + pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.caracters + " caracters**__,\n");
							} else {
								l += (pos.toString() + ". " + message.guild.members.get(element.user_id) + ": " + element.caracters + " caracters,\n");
							};
							
							pos++;
						});
					} else {
						res.forEach(element => {
							if(element.user_id === message.author.id) {
								l += ("__**" + pos.toString() + ". " + message.guild.members.get(element.user_id) + ": lvl." + element.level + " - " + element.xp + "xp**__,\n");
							} else {
								l += (pos.toString() + ". " + message.guild.members.get(element.user_id) + ": lvl." + element.level + " - " + element.xp + "xp,\n");
							};
											
							pos++;
						});
					};
				};
			};

			embed.setDescription(l);

			message.channel.send(embed);
		});
	};
};