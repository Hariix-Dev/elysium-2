/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const Globals = require("../models/globals");

module.exports = class global {
	constructor() {
		this.name = "global",
		this.alias = [],
		this.en = "Change value of your global account.",
		this.fr = "Modifie des valeurs de votre compte.",
		this.usage = "/global <var: lang>";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		Globals.findOne({user_id: message.author.id}, (err, res) => {
			if(err) {
				log(err, "ERROR");

				if(data.lang === "fr") return sendE("Je n'ai pas pu lire les données du compte.");
				if(data.alng === "en") return sendE("I couldn't read the account data.");
			};

			if(!res) {
				if(data.lang === "fr") return sendE("Vous n'avez pas de compte global.");
				if(data.lang === "en") return sendE("I don't have an global account.");	
			};

			switch(args[1]) {
				case "lang":
					if(args.length === 2) {
						if(data.lang === "fr") return message.channel.send("La langue par défaut quand vous rejoignez un serveur est: **" + res.lang + "**");
						if(data.lang === "en") return message.channel.send("The default language when you join a server is: **" + res.lang + "**");
					} else {
						if(args[2] === "fr" || args[2] === "en") {
							res.lang = args[2];

							res.save().then(() => {
								if(data.lang === "fr") return sendC("La langue par défaut quand vous rejoignez un serveur est maintenant: **" + args[2] + "**");
								if(data.lang === "en") return sendC("The default language when you join a server is now: **" + args[2] + "**");
							}).catch(err => {
								if(data.lang === "fr") return sendE("La langue sur le compte global n'a pas pu être mise à jour.");
								if(data.lang === "en") return sendE("The language on the global account could not be updated.");

								return log(err, "ERROR");
							});
						} else {
							if(data.lang === "fr") return sendE("Langue '" + args[2] + "' non reconnue. Langues supportées: fr, en.");
							if(data.lang === "en") return sendE("Language '" + args[2] + "' not recognized. Supported languages: fr, en.");
						};
					};
				break;
			
				default:
					if(data.lang === "fr") return sendE("Argument 'var' absent ou invalide. Syntaxe: " + settings.prefix + "global <var: lang>");
					if(data.lang === "en") return sendE("Absent or invalid 'var' argument. Syntax: " + settings.prefix + "global <var: lang>");
				break;
			};
		});
	};
};