/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const Users = require("../models/users");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const Globals = require("../models/globals");

module.exports = class stats {
	constructor() {
		this.name = "stats",
		this.alias = [],
		this.usage = "/stats [@user]";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.pistache)
		});

		let mUser;

		switch(args.length) {
			case 1:
				Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, res) => {
					if(err || (!res)) {
						log(err, "ERROR");

						if(data.lang === "fr") return sendE("Une erreur est survenue lors de la récupération des données.");
						if(data.lang === "en") return sendE("An error occurred during data recovery.");
					};

					if(!res) {
						if(data.lang === "fr") return sendE("Il semblerait que vous n'avez pas encore de compte.");
						if(data.lang === "en") return sendE("It seems you don't have an account for now.");
					};

					if(data.lang === "fr") {
						embed.setAuthor("Compte en banque de " + message.author.tag, message.author.avatarURL).setDescription("Vous avez **" + res.money + settings.currency + "** sur votre compte.");
					};
					if(data.lang === "en"){
						embed.setAuthor("Money of " + message.author.tag, message.author.avatarURL).setDescription("You have **" + res.money + settings.currency + "** on your account.");
					};

					message.channel.send(embed).catch();
				});
			break;

			case 2:
				mUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]));

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
						if(data.lang === "fr") return sendE("Cette utilisateur n'a pas encore de compte.");
						if(data.lang === "en") return sendE("This user does not have an account for now.");
					};

					if(data.lang === "fr") embed.setAuthor("Compte en banque de " + mUser.user.tag, mUser.user.avatarURL).setDescription(mUser.user.tag + " à **" + res.money + settings.currency + "** sur son compte.");
					if(data.lang === "en") embed.setAuthor("Money of " + message.author.tag, message.author.avatarURL).setDescription(mUser.user.tag + " have **" + res.money + settings.currency + "** on his account.");

					message.channel.send(embed).catch();
				});
			break;
			
			default:
				if(data.lang === "fr") return sendE("Argument 'user' incorrect. Syntaxe: " + settings.prefix + "money [@user]");
				if(data.lang === "en") return sendE("Incorrect 'user' argument. Syntax: " + settings.prefix + "money [@user]");
			break;
		};
	};
};