/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");

module.exports = class random {
	constructor() {
		this.name = "random",
		this.alias = [],
		this.en = "Give random numbers.",
		this.fr = "Donne des nombres aléatoires.",
		this.usage = "/random [range:[max],[min] [max]]";
	};

	run(bot, message, args, data, settings, db) {
		var log = (text, level) => logger(text, level, bot, __filename);

		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		let number;
		let embed = new Discord.RichEmbed().setColor("LUMINOUS_VIVID_PINK");
		let min, max;

		switch(args.length) {
			case 1:
				number = Math.random();

				if(data.lang === "fr") embed.setTitle(":game_die: Entre 0 et 1: " + number);
				if(data.lang === "en") embed.setTitle(":game_die: Between 0 and 1: " + number);
			break;

			case 2:
				max = Number(args[1]);

				if(isNaN(max)) {
					if(data.lang === "fr") return sendE("Argument 'range' invalide. Syntaxe: " + settings.prefix + "random [range:[max],[min] [max]]");
					if(data.lang === "en") return sendE("Argument 'range' invalid. Syntax:" + settings.prefix + "random [range:[max],[min] [max]]");
				};

				number = Math.floor(Math.random() * (max + 1));

				if(data.lang === "fr") embed.setTitle("Entre 0 et " + max + ": " + number);
				if(data.lang === "en") embed.setTitle("Between 0 and " + max + ": " + number);
			break;

			case 3:
				min = Number(args[1]);
				max = Number(args[2]);

				if(isNaN(min) || isNaN(max)) {
					if(data.lang === "fr") return sendE("Argument 'range' invalide. Syntaxe: " + settings.prefix + "random [range:[max],[min] [max]]");
					if(data.lang === "en") return sendE("Argument 'range' invalid. Syntax:" + settings.prefix + "random [range:[max],[min] [max]]");
				};

				number = Math.floor(Math.random() * (max - min + 1)) + min;

				if(data.lang === "fr") embed.setTitle("Entre " + min + " et " + max + ": " + number);
				if(data.lang === "en") embed.setTitle("Between " + min + " and " + max + ": " + number);
			break;

			default:
				if(data.lang === "fr") return sendE("Arguments supplémentaires non supportés. Syntaxe: " + settings.prefix + "random [range:[max],[min] [max]]");
				if(data.lang === "en") return sendE("Additional arguments not supported. Syntax: " + settings.prefix + "random [range:[max],[min] [max]]");
			break;
		};

		message.channel.send(embed).then(() => message.delete().catch()).catch();
	};
};