/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const fetch = require("node-fetch");
const logger = require("../modules/logger");

module.exports = class facts {
	constructor() {
		this.name = "facts",
		this.alias = ["fact"],
		this.en = "Get facts of somes animals.",
		this.fr = "Donnes des informations sur des animaux.",
		this.usage = "/facts <subject:dog, cat, panda, fox>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		if(args.length === 2) {
			//BUG with using if(args[1] !== ("dog" || "cat" || "panda")) {...};, it takes only "dog". Cause with the CommandHandler?
			if((args[1] !== "dog") && (args[1] !== "cat") && (args[1] !== "panda") && (args[1] !== "fox") && (args[1] !== "koala") && (args[1] !== "bird")) {
				if(data.lang === "fr") return sendE("Argument 'subject' invalide. Syntaxe: " + settings.prefix + "facts <subject:dog, cat, panda, fox, koala, bird>");
				if(data.lang === "en") return sendE("Argument 'subject' invalid. Syntax:" + settings.prefix + "facts <subject:dog, cat, panda, fox, koala, bird>");
			};
			
			fetch("https://some-random-api.ml/facts/" + args[1]).then(res => res.json().then(fact => {
				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					description: ":information_source: **" + fact.fact + "**"
				});

				message.channel.send(embed);
			})).catch(err => {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
				if(data.lang === "en") sendE("An error occurred, try again later...");

				return log(err, "ERROR");
			});
		} else {
			if(data.lang === "fr") return sendE("Argument 'subject' absent. Syntaxe: " + settings.prefix + "facts <subject:dog, cat, panda, fox, koala, bird>");
			if(data.lang === "en") return sendE("Argument 'subject' absent. Syntax:" + settings.prefix + "facts <subject:dog, cat, panda, fox, koala, bird>");
		};
	};
};