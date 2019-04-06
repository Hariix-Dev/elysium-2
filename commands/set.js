/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const config = require("../assets/config.json");

module.exports = class server {
	constructor() {
		this.name = "server",
		this.alias = ["set"],
		this.usage = "/server <var> [value]";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);

		var variable;
		var value;

		switch(args.length) {
			case 1:
				if(data.lang === "fr") sendE("L'argument 'var' est absent. Syntaxe: " + settings.prefix + "set <var> [value].");
				if(data.lang === "en") sendE("The'var' argument is missing. Syntax: " + settings.prefix + "set <var> [value].");
			break;

			case 2:
				variable = args[1].toString().toUpperCase();

				switch(variable) {
					case "PREFIX":
						if(data.lang === "fr") return message.channel.send("Le préfixe des commandes du serveur est ``" + settings.prefix + "``.");
						if(data.lang === "en") return message.channel.send("The prefix for server commands is ``" + settings.prefix + "``.");
					break;

					case "DEFAULTLANG":
						if(data.lang === "fr") return message.channel.send("La langue par défaut pour le serveur est ``" + settings.defaultLang + "``.");
						if(data.lang === "en") return message.channel.send("The default language for the server is ``" + settings.defaultLang + "``.");
					break;

					case "MONEYCHAR":
						if(data.lang === "fr") return message.channel.send("La monnaie actuelle est le ``" + settings.currency + "``.");
						if(data.lang === "en") return message.channel.send("The current currency is the ``" + settings.currency + "``.");
					break;

					case "STARTMONEY":
						if(data.lang === "fr") return message.channel.send("La somme de départ est de ``" + settings.startMoney + " " + settings.currency + "``.");
						if(data.lang === "en") return message.channel.send("The starting sum is ``" + settings.startMoney + " " + settings.currency + "``.");
					break;

					case "ANNOUNCEMENTCHANNEL":
						if(data.lang === "fr") return message.channel.send("L'id du salons général est ``" + settings.announcementsChannel + "``.");
						if(data.lang === "en") return message.channel.send("The id of the general channel is ``" + settings.announcementsChannel + "``.");
					break;

					case "GENCHANNEL":
						if(data.lang === "fr") return message.channel.send("L'id du salons général est ``" + settings.announcementsChannel + "``.");
						if(data.lang === "en") return message.channel.send("The id of the general channel is ``" + settings.announcementsChannel + "``.");
					break;

					case "PLUGINS":
						if(data.lang === "fr") {
							//read
						} else {
							if(data.lang === "en") {
								//read
							};
						};
					break;

					default:
						if(data.lang === "fr") return sendE("Aucune variable correspond à '" + variable + "'. Variables disponibles: prefix, defaultLang, moneyChar, startMoney, announcementsChannel (ou genChannel), plugins.");
						if(data.lang === "en") return sendE("No variable corresponds to '" + variable + "'. Variables available: prefix, defaultLang, moneyChar, startMoney, announcementsChannel (or genChannel), plugins.");
					break;
				};
			break;

			case 3:
				if(!message.member.hasPermission("MANAGE_GUILD", false, true, true)) {
					if(data.lang === "fr") return sendE("Vous n'avez pas la permission de modifier les valeurs du serveur.");
					if(data.lang === "en") return sendE("You do not have permission to change the server values.");
				};

				variable = args[1].toString().toUpperCase();
				value = args[2];

				switch(variable) {
					case "PREFIX":
						if((value.length < 1 || value.length > 5) && value !== "reset") {
							if(data.lang === "fr") return sendE("La longueur du préfixe doit être comprise entre 1 et 5 caractères.");
							if(data.lang === "en") return sendE("The length of the prefix must be between 1 and 5 characters.");
						};

						if(value === "reset") value = config.default.prefix;

						db.query("UPDATE servers_settings SET prefix = '" + value + "' WHERE server_id = '" + message.guild.id + "';", function(err, result, fields) {
							if(err) {
								log(err, "ERROR");

								if(data.lang === "fr") return sendE("Une erreur est survenue lors de la mise à jour de la variable.");
								if(data.lang === "en") return sendE("An error occurred when updating the variable.");
							};

							if(data.lang === "fr") return sendC("Le préfixe des commandes pour ce serveur est maintenant ``" + value + "``.");
							if(data.lang === "en") return sendC("The command prefix for this server is now ``" + value + "``.");
						});
					break;

					case "DEFAULTLANG":
						if(value !== ("fr" || "en" || "reset")) {
							if(data.lang === "fr") return sendE("'" + value + "' n'est pas une langue valide. Langues disponibles: fr, en");
							if(data.lang === "en") return sendE("'" + value + "' is not a valid language. Available languages: fr, en");
						};

						if(value === "reset") value = config.default.lang;

						db.query("UPDATE servers_settings SET defaultLang = '" + value + "' WHERE server_id = '" + message.guild.id + "';", function(err, result, fields) {
							if(err) {
								log(err, "ERROR");

								if(data.lang === "fr") return sendE("Une erreur est survenue lors de la mise à jour de la variable.");
								if(data.lang === "en") return sendE("An error occurred when updating the variable.");
							};

							if(data.lang === "fr") return sendC("La langue par défaut pour le serveur est mainteant ``" + value + "``.");
							if(data.lang === "en") return sendC("The default language for the server is now ``" + value + "``.");
						});
					break;

					case "MONEYCHAR":
						if((value.length < 1 || value.length > 3) && value !== "reset") {
							if(data.lang === "fr") return sendE("La longueur du symbole doit être comprise entre 1 et 3 caractères.");
							if(data.lang === "en") return sendE("The length of the symbol must be between 1 and 3 characters.");
						};

						if(value === "reset") value = config.default.currency;

						db.query("UPDATE servers_settings SET money_char = '" + value + "' WHERE server_id = '" + message.guild.id + "';", function(err, result, fiels) {
							if(err) {
								log(err, "ERROR");
								
								if(data.lang === "fr") return sendE("Une erreur est survenue lors de la mise à jour de la variable.");
								if(data.lang === "en") return sendE("An error occurred when updating the variable.");
							};

							if(data.lang === "fr") return sendC("La monnaie est maintenant le ``" + value + "``.");
							if(data.lang === "en") return sendC("The currency is now the ``" + value + "``.");
						});
					break;

					case "STARTMONEY":
						log(typeof value);

						if(value < 0 || value > 4294967295) log("ok");

						if(data.lang === "fr") return message.channel.send("La somme de départ est de ``" + settings.startMoney + " " + settings.currency + "``.");
						if(data.lang === "en") return message.channel.send("The starting sum is ``" + settings.startMoney + " " + settings.currency + "``.");
					break;

					case "ANNOUNCEMENTCHANNEL":
						if(data.lang === "fr") return message.channel.send("L'id du salons général est ``" + settings.announcementsChannel + "``.");
						if(data.lang === "en") return message.channel.send("The id of the general channel is ``" + settings.announcementsChannel + "``.");
					break;

					case "GENCHANNEL":
						if(data.lang === "fr") return message.channel.send("L'id du salons général est ``" + settings.announcementsChannel + "``.");
						if(data.lang === "en") return message.channel.send("The id of the general channel is ``" + settings.announcementsChannel + "``.");
					break;

					case "PLUGINS":
						if(data.lang === "fr") {
							//write
						} else {
							if(data.lang === "en") {
								//write
							};
						};
					break;

					default:
						if(data.lang === "fr") return sendE("Aucune variable correspond à '" + variable + "'. Variables disponibles: prefix, defaultLang, moneyChar, startMoney, announcementsChannel (ou genChannel), plugins.");
						if(data.lang === "en") return sendE("No variable corresponds to '" + variable + "'. Variables available: prefix, defaultLang, moneyChar, startMoney, announcementsChannel (or genChannel), plugins.");
					break;
				};
			break;

			default: 
				if(data.lang === "fr") return sendE("Arguments inutiles > " + args[3] + ". Syntaxe: " + settings.prefix + "set <var> [value].");
				if(data.lang === "en") return sendE("Unnecessary arguments > " + args[3] + ". Syntax: " + settings.prefix + "set <var> [value].");
			break;
		};
	};
};