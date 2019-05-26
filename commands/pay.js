/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const logger = require("../modules/logger");
const reply = require("../modules/replyEmbed");
const Users = require("../models/users");

module.exports = class pay {
	constructor() {
		this.name = "pay",
		this.alias = [],
		this.usage = "/pay <@user> <amount>";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		if(args.length === 3) {
			args.shift();
			const pUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
			const amount = Number(args[1]);

			if(isNaN(amount)) {
				if(data.lang === "fr") return sendE("Argument 'amount' incorrect. Syntaxe: " + settings.prefix + "money [@user] [action:set, add, remove] [value]");
				if(data.lang === "en") return sendE("Incorrect 'amount' argument. Syntax: " + settings.prefix + "money [@user] [action:set, add, remove] [value]");
			};

			if(amount < 0) {
				if(data.lang === "fr") return sendE("L'Argument 'amount' doit être supérieur à zéro.");
				if(data.lang === "en") return sendE("Incorrect 'amount' argument.");
			};

			if(!pUser) {
				if(data.lang === "fr") return sendE("Je n'ai pas trouvée cette utilisateur.");
				if(data.lang === "en") return sendE("Couldn't find this user.");
			};

			if(pUser.id === message.author.id) {
				if(data.lang === "fr") return sendE("Vous ne pouvez pas vous donner de l'argent à vous même.");
				if(data.lang === "en") return sendE("You can't give yourself money.");
			};

			Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, aUser) => {
				if(err) {
					log(err, "ERROR");

					if(data.lang === "fr") return sendE("Une erreur est survenue lors de la récupération des données.");
					if(data.lang === "en") return sendE("An error occurred during data recovery.");
				};

				if(!aUser) {
					if(data.lang === "fr") return sendE("Il semblerait que vous n'avez pas encore de compte.");
					if(data.lang === "en") return sendE("It seems you don't have an account for now.");
				};

				if(aUser.money < amount) {
					if(data.lang === "fr") return sendE("Vous n'avez pas assez d'argent.");
					if(data.lang === "en") return sendE("You don't have enough money.");
				};

				Users.findOne({user_id: pUser.id, server_id: message.guild.id}, (err, res) => {
					if(err) {
						log(err, "ERROR");
	
						if(data.lang === "fr") return sendE("Une erreur est survenue lors de la récupération des données.");
						if(data.lang === "en") return sendE("An error occurred during data recovery.");
					};

					if(!res) {
						if(data.lang === "fr") return sendE("Cette utilisateur n'a pas encore de compte.");
						if(data.lang === "en") return sendE("This user does not have an account for now.");
					};

					aUser.money -= amount;
					res.money += amount;

					aUser.save().catch(err => {
						log(err, "ERROR");

						if(data.lang === "fr") return sendE("La transaction n'a pas pu s'effectuer.");
						if(data.lang === "en") return sendE("The transaction could not be completed.");
					}).then(() => {
						res.save().catch(err => {
							log(err, "ERROR");

							if(data.lang === "fr") return sendE("La transaction n'a pas pu s'effectuer.");
							if(data.lang === "en") return sendE("The transaction could not be completed.");
						}).then(() => {
							if(data.lang === "fr") return sendC("Vous avez bien donné " + amount + settings.currency + " à " + pUser.user.tag);
							if(data.lang === "en") return sendC("You did give " + amount + settings.currency + " to " + pUser.user.tag);
						});
					});
				});
			});
		} else {
			if(data.lang === "fr") return sendE("Arguments absents ou invalides. Synatxe: " + settings.prefix + "pay <@user> <amount>");
			if(data.lang === "en") return sendE("Absent or invalid arguments. Syntax: " + settings.prefix + "pay <@user> <amount>");
		};
	};
};