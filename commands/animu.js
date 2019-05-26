/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const fetch = require("node-fetch");
const logger = require("../modules/logger");

module.exports = class animu {
	constructor() {
		this.name = "animu",
		this.alias = ["animu"],
		this.usage = "/animu <name:wink, pat, hug>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		if(args.length === 2) {
			//BUG with using if(args[1] !== ("dog" || "cat" || "panda")) {...};, it takes only "dog". Cause with the CommandHandler?
			if((args[1] !== "wink") && (args[1] !== "pat") && (args[1] !== "hug")) {
				if(data.lang === "fr") return sendE("Argument 'name' invalide. Syntaxe: " + settings.prefix + "animu <name:wink, pat, hug>");
				if(data.lang === "en") return sendE("Argument 'name' invalid. Syntax:" + settings.prefix + "animu <name:wink, pat, hug>");
			};

			fetch("https://some-random-api.ml/animu/" + args[1]).then(res => res.json().then(image => {
				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					image: {
						url: image.link
					}
				});

				let title;

				if(data.lang === "fr") title = "Impossible de voir l'image? Cliquez ici! Discord n'aime pas les grandes images.";
				if(data.lang === "en") title = "Can't see the image? Click here! Discord does not like large images.";

				embed.setTitle(title).setURL(image.link);

				message.channel.send(embed);
			})).catch(err => {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
				if(data.lang === "en") sendE("An error occurred, try again later...");

				return log(err, "ERROR");
			});
		} else {
			if(data.lang === "fr") return sendE("Argument 'name' absent. Syntaxe: " + settings.prefix + "animu <name:wink, pat, hug>");
			if(data.lang === "en") return sendE("Argument 'name' absent. Syntax:" + settings.prefix + "animu <name:wink, pat, hug>");
		};
	};
};