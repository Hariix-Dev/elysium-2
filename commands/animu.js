/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const request = require("request");
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

			request("https://some-random-api.ml/animu/" + args[1], function(err, response, body) {
				if(err || response.statusCode != 200) {
					if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
					if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

					return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
				};

				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let image = JSON.parse(body);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					image: {
						url: image.link
					}
				});

				message.channel.send(embed);
			});
		} else {
			if(data.lang === "fr") return sendE("Argument 'name' absent. Syntaxe: " + settings.prefix + "animu <name:wink, pat, hug>");
			if(data.lang === "en") return sendE("Argument 'name' absent. Syntax:" + settings.prefix + "animu <name:wink, pat, hug>");
		};
	};
};