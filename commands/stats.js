/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const Users = require("../models/users");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const serial = require("../assets/serial.json");

module.exports = class stats {
	constructor() {
		this.name = "stats",
		this.alias = [],
		this.en = "Give stats about an user.",
		this.fr = "Donnes des stats d'un utilisateur.",
		this.usage = "/stats [@user]";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.pistache)
		});

		switch(args.length) {
			case 1:
				Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, res) => {
					if(err) {
						log(err, "ERROR");

						if(data.lang === "fr") return sendE("Une erreur est survenue lors de la récupération des données.");
						if(data.lang === "en") return sendE("An error occurred during data recovery.");
					};

					if(!res) {
						if(data.lang === "fr") return sendE("Il semblerait que vous n'avez pas encore de compte.");
						if(data.lang === "en") return sendE("It seems you don't have an account for now.");
					};

					let t = 0;

					Users.find({}, (e, g) => {
						if(e) return log(e, "ERROR");

						if(!g) return;

						g.forEach(u => t += u.money);

						if(data.lang === "fr") {
							embed.setAuthor("Statistiques de " + message.author.tag, message.author.avatarURL).addField(":speech_balloon: Messages envoyés:", "**" + res.messages + "** messages.", true).addField(":pen_fountain: Caractères en total:", "**" + res.caracters + "** caractères.\nSoit " + (res.caracters / 280).toFixed(2) + " tweets.", true).addField(":moneybag: Argent:", "**" + res.money + settings.currency + "**.\nTu as " + ((res.money / t) * 100).toFixed(3) + "% des richesses du serveur.").addField(":military_medal: Niveau:", "Vous êtes au niveau **" + res.level + "**. (XP: " + res.xp + ", " + (res.xp / res.messages).toFixed(3) + " xp/message)\n" + (serial[res.level + 1] - res.xp) + "xp jusqu'au niveau suivant. (" + res.xp + "/" + serial[res.level + 1] + ")").addField(":hammer: Sanctions:", "**" + res.bans + " banissements.\n" + res.kicks + " expulsions.**");
						};
						if(data.lang === "en"){
							embed.setAuthor(message.author.tag + "'s stats", message.author.avatarURL).addField(":speech_balloon: Messages sents:", "**" + res.messages + "** messages.", true).addField(":pen_fountain: Caracters sents:", "**" + res.caracters + "** caracters.\nThat's " + (res.caracters / 280).toFixed(2) + " tweets.", true).addField(":moneybag: Money:", "**" + res.money + settings.currency + "**.\nYou have " + ((res.money / t) * 100).toFixed(3) + "% of the server's wealth.").addField(":military_medal: XP & Levels:", "You are at level **" + res.level + "**. (XP: " + res.xp + ", " + (res.xp / res.messages).toFixed(3) + " xp/message)\n" + (serial[res.level + 1] - res.xp) + "xp to level up. (" + res.xp + "/" + serial[res.level + 1] + ")").addField(":hammer: Sanctions:", "**" + res.bans + " bans.\n" + res.kicks + " kicks.**");
						};
	
						message.channel.send(embed).catch();
					});
				});
			break;

			case 2:
				const mUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));

				if(!mUser) {
					if(data.lang === "fr") return sendE("Je n'ai pas trouvée cette utilisateur.");
					if(data.lang === "en") return sendE("Couldn't find this user.");
				};

				Users.findOne({user_id: mUser.id, server_id: message.guild.id}, (err, res) => {
					if(err) {
						log(err, "ERROR");

						if(data.lang === "fr") return sendE("Une erreur est survenue lors de la récupération des données.");
						if(data.lang === "en") return sendE("An error occurred during data recovery.");
					};

					if(!res) {
						if(data.lang === "fr") return sendE("Il semblerait que " + mUser.user.tag + " n'as pas encore de compte.");
						if(data.lang === "en") return sendE("It seems " + mUser.user.tag + " doesn't have an account yet.");
					};

					let t = 0;

					Users.find({}, (e, g) => {
						if(e) return log(e, "ERROR");

						if(!g) return;

						g.forEach(u => t += u.money);

						if(data.lang === "fr") {
							embed.setAuthor("Statistiques de " + mUser.user.tag, mUser.user.avatarURL).addField(":speech_balloon: Messages envoyés:", "**" + res.messages + "** messages.", true).addField(":pen_fountain: Caractères en total:", "**" + res.caracters + "** caractères.\nSoit " + (res.caracters / 280).toFixed(2) + " tweets.", true).addField(":moneybag: Argent:", "**" + res.money + settings.currency + "**.\nIl as " + ((res.money / t) * 100).toFixed(3) + "% des richesses du serveur.").addField(":military_medal: Niveau:", "Il est au niveau **" + res.level + "**. (XP: " + res.xp + ", " + (res.xp / res.messages).toFixed(3) + " xp/message)\n" + (serial[res.level + 1] - res.xp) + "xp jusqu'au niveau suivant. (" + res.xp + "/" + serial[res.level + 1] + ")").addField(":hammer: Sanctions:", "**" + res.bans + " banissements.\n" + res.kicks + " expulsions.**");
						};
						if(data.lang === "en"){
							embed.setAuthor(mUser.user.tag + "'s stats", mUser.user.avatarURL).addField(":speech_balloon: Messages sents:", "**" + res.messages + "** messages.", true).addField(":pen_fountain: Caracters sents:", "**" + res.caracters + "** caracters.\nThat's " + (res.caracters / 280).toFixed(2) + " tweets.", true).addField(":moneybag: Money:", "**" + res.money + settings.currency + "**.\nHe have " + ((res.money / t) * 100).toFixed(3) + "% of the server's wealth.").addField(":military_medal: XP & Levels:", "He's on level **" + res.level + "**. (XP: " + res.xp + ", " + (res.xp / res.messages).toFixed(3) + " xp/message)\n" + (serial[res.level + 1] - res.xp) + "xp to level up. (" + res.xp + "/" + serial[res.level + 1] + ")").addField(":hammer: Sanctions:", "**" + res.bans + " bans.\n" + res.kicks + " kicks.**");
						};
	
						message.channel.send(embed).catch();
					});
				});
			break;
			
			default:
				if(data.lang === "fr") return sendE("Argument 'user' incorrect. Syntaxe: " + settings.prefix + "stats [@user]");
				if(data.lang === "en") return sendE("Incorrect 'user' argument. Syntax: " + settings.prefix + "stats [@user]");
			break;
		};
	};
};