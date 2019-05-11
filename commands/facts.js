/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const request = require("request");
const logger = require("../modules/logger");

module.exports = class facts {
	constructor() {
		this.name = "facts",
		this.alias = ["fact"],
		this.usage = "/facts <subject:dog, cat, panda, fox>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		if(args.length === 2) {
			//BUG with using if(args[1] !== ("dog" || "cat" || "panda")) {...};, it takes only "dog". Cause with the CommandHandler?
			if((args[1] !== "dog") && (args[1] !== "cat") && (args[1] !== "panda") && (args[1] !== "fox")) {
				if(data.lang === "fr") return sendE("Argument 'subject' invalide. Syntaxe: " + settings.prefix + "facts <subject:dog, cat, panda, fox>");
				if(data.lang === "en") return sendE("Argument 'subject' invalid. Syntax:" + settings.prefix + "facts <subject:dog, cat, panda, fox>");
			};

			request("https://some-random-api.ml/facts/" + args[1], function(err, response, body) {
				if(err || response.statusCode != 200) {
					if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
					if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

					return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
				};

				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let fact = JSON.parse(body);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					description: ":information_source: **" + fact.fact + "**"
				});

				message.channel.send(embed);
			});
		} else {
			if(data.lang === "fr") return sendE("Argument 'subject' absent. Syntaxe: " + settings.prefix + "facts <subject:dog, cat, panda, fox>");
			if(data.lang === "en") return sendE("Argument 'subject' absent. Syntax:" + settings.prefix + "facts <subject:dog, cat, panda, fox>");
		};
	};
};