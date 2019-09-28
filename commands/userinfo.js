/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const moment = require("moment");
const Users = require("../models/users");
const logger = require("../modules/logger");

module.exports = class userinfo {
	constructor() {
		this.name = "userinfo",
		this.alias = ["userinfos", "ui"],
		this.en = "Get infos about an user.",
		this.fr = "Donne des informations sur un utilisateur.",
		this.usage = "/userinfo [@user]";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.blue),
			timestamp: Date.now(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.avatarURL
			}
		});

		if(args.length === 1) {
			if(data.lang === "fr") {
				moment.locale("fr");

				embed.setAuthor("Information sur " + message.author.username, message.author.avatarURL).setThumbnail(message.author.avatarURL).addField("Nom d'utilisateur", message.author.username, true).addField("Discriminateur", message.author.discriminator, true).addField("Tag", message.author.tag, true).addField("Surnom", message.member.nickname, true).addField("ID", message.author.id, true).addField("Compte crée à", moment(message.author.createdAt).format("Do MMMM YYYY, HH:mm:ss") + " (" + moment(message.author.createdAt).fromNow() + ")", false).addField("Roles (" + message.member.roles.size + ")", message.member.roles.map(r => r.name).join(", "), false);

				let c = "Vous êtes actuellement " + message.author.presence.status + ". ";
				let game;

				if(message.author.presence.game) {
					let type;

					switch(message.author.presence.game.type) {
						case 0: type = "Vous jouez à "; break;
						case 1: type = "Vous êtes en live: "; break;
						case 2: type = "Vous écoutez "; break;
						case 3: type = "Vous regardez "; break;
					};

					game = type + "**" + message.author.presence.game.name + "**. ";
				} else {
					game = "Vous ne jouez à rien.";
				};

				embed.setDescription(c + game);

				Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, res) => {
					if(err) return log(err, "ERROR");

					if(res) embed.addField("Données", "Langue: **" + res.lang + "**,\nMessages envoyés: **" + res.messages + "**,\nCaractères envoyés: **" + res.caracters + "**,\nArgent: **" + res.money + "**,\nXP: **" + res.xp + "**,\nNiveau: **" + res.level + "**,\nBanissements: **" + res.bans + "**,\nExpulsions: **" + res.kicks + "**");

					return message.channel.send(embed);
				});
			};

			if(data.lang === "en") {
				moment.locale("en");

				embed.setAuthor(message.author.username + "'s infos", message.author.avatarURL).setThumbnail(message.author.avatarURL).addField("Username", message.author.username, true).addField("Discriminator", message.author.discriminator, true).addField("Tag", message.author.tag, true).addField("Nickname", message.member.nickname, true).addField("ID", message.author.id, true).addField("Account created at", moment(message.author.createdAt).format("Do MMMM YYYY, HH:mm:ss") + " (" + moment(message.author.createdAt).fromNow() + ")", false).addField("Roles (" + message.member.roles.size + ")", message.member.roles.map(r => r.name).join(", "), false);

				let c = "You are currently " + message.author.presence.status + ". ";
				let game;

				if(message.author.presence.game) {
					let type;

					switch(message.author.presence.game.type) {
						case 0: type = "You play "; break;
						case 1: type = "You are in stream: "; break;
						case 2: type = "You're listening "; break;
						case 3: type = "You're watching "; break;
					};

					game = type + "**" + message.author.presence.game.name + "**. ";
				} else {
					game = "You don't play anything.";
				};

				embed.setDescription(c + game);

				Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, res) => {
					if(err) return log(err, "ERROR");

					if(res) embed.addField("Data", "Language: **" + res.lang + "**,\nMessages sents: **" + res.messages + "**,\nCaracters sents: **" + res.caracters + "**,\nMoney: **" + res.money + "**,\nXP: **" + res.xp + "**,\nLevel: **" + res.level + "**,\nBans: **" + res.bans + "**,\nKicks: **" + res.kicks + "**");

					return message.channel.send(embed);
				});
			};
		} else {
			const pUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));

			if(!pUser) {
				if(data.lang === "fr") return sendE("Je n'ai pas trouvée cette utilisateur.");
				if(data.lang === "en") return sendE("Couldn't find this user.");
			};

			if(data.lang === "fr") {
				moment.locale("fr");

				embed.setAuthor("Information sur " + pUser.user.username, pUser.user.avatarURL).setThumbnail(pUser.user.avatarURL).addField("Nom d'utilisateur", pUser.user.username, true).addField("Discriminateur", pUser.user.discriminator, true).addField("Tag", pUser.user.tag, true).addField("Surnom", pUser.nickname, true).addField("ID", pUser.user.id, true).addField("Compte crée à ", moment(pUser.user.createdAt).format("Do MMMM YYYY, HH:mm:ss")  + " (" + moment(message.author.createdAt).fromNow() + ")", false).addField("Roles (" + pUser.roles.size + ")", pUser.roles.map(r => r.name).join(", "), false);
				
				let c = pUser.user.username + " est actuellement " + pUser.presence.status + ". ";
				let game;

				if(pUser.user.bot) c += "C'est un bot. ";

				if(pUser.presence.game) {
					let type;

					switch(pUser.presence.game.type) {
						case 0: type = " est entrain de jouer à "; break;
						case 1: type = " est en live: "; break;
						case 2: type = " écoute "; break;
						case 3: type = " regarde "; break;
					};

					game = "Il " + type + "**" + pUser.presence.game.name + "**. ";
				} else {
					game = "Il ne joue à rien. ";
				};

				embed.setDescription(c + game);

				Users.findOne({user_id: pUser.user.id, server_id: message.guild.id}, (err, res) => {
					if(err) return log(err, "ERROR");

					if(res) embed.addField("Données", "Langue: **" + res.lang + "**,\nMessages envoyés: **" + res.messages + "**,\nCaractères envoyés: **" + res.caracters + "**,\nArgent: **" + res.money + "**,\nXP: **" + res.xp + "**,\nNiveau: **" + res.level + "**,\nBanissements: **" + res.bans + "**,\nExpulsions: **" + res.kicks + "**");

					return message.channel.send(embed);
				});
			};

			if(data.lang === "en") {
				moment.locale("en");

				embed.setAuthor(pUser.user.username + "'s infos", pUser.user.avatarURL).setThumbnail(pUser.user.avatarURL).addField("Username", pUser.user.username, true).addField("Discriminator", pUser.user.discriminator, true).addField("Tag", pUser.user.tag, true).addField("Nickname", pUser.nickname, true).addField("ID", pUser.user.id, true).addField("Account created at", moment(pUser.user.createdAt).format("Do MMMM YYYY, HH:mm:ss")  + " (" + moment(message.author.createdAt).fromNow() + ")", false).addField("Roles (" + pUser.roles.size + ")", pUser.roles.map(r => r.name).join(", "), false);

				let c = pUser.user.username + " is " + pUser.presence.status + ". ";
				let game;

				if(pUser.user.bot) c += "It's a bot";

				if(pUser.presence.game) {
					let type;

					switch(pUser.presence.game.type) {
						case 0: type = " plays "; break;
						case 1: type = "'s live: "; break;
						case 2: type = " listen "; break;
						case 3: type = " watch "; break;
					};

					game = "He " + type + "**" + pUser.presence.game.name + "**. ";
				} else {
					game = "He's not playing anything. ";
				};

				embed.setDescription(c + game);

				Users.findOne({user_id: pUser.user.id, server_id: message.guild.id}, (err, res) => {
					if(err) return log(err, "ERROR");

					if(res) embed.addField("Data", "Language: **" + res.lang + "**,\nMessages sents: **" + res.messages + "**,\nCaracters sents: **" + res.caracters + "**,\nMoney: **" + res.money + "**,\nXP: **" + res.xp + "**,\nLevel: **" + res.level + "**,\nBans: **" + res.bans + "**,\nKicks: **" + res.kicks + "**");
					
					return message.channel.send(embed);
				});
			};
		};
	};
};