/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
require("dotenv").config();

const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const api = require('some-random-api');
const converter = require("../modules/hexConverter");

module.exports = class mc {
	constructor() {
		this.name = "mc",
		this.alias = [],
		this.en = "Give infos of an MC username.",
		this.fr = "Donne des informations sur un pseudo MC.",
		this.usage = "/mc <name>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (text, level) => logger(text, level, bot, __filename);

		if(args.length === 1) {
			//Check in the global account if has a mc name

			if(data.lang === "fr") return sendE("Argument 'name' absent. Syntaxe: " + settings.prefix + "mc <name>");
			if(data.lang === "en") return sendE("Argument 'name' absent. Syntax:" + settings.prefix + "mc <name>");
		};

		args.shift();

		let hex = Math.floor(Math.random() * 16777215).toString(16);

		api.mc(args).then(res => {
			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(hex),
				description: "**UUID:** " + res.trimmed_uuid,
				author: {
					name: res.username,
					icon_url: process.env.SERVER + "assets/thumbnails/minecraft.png"
				}
			});

			let a = [];
			res.name_history.forEach(names => {
				a.push("- " + names.name + ": " + names.changedToAt);
			});

			let title;
			if(data.lang === "fr") title = "Pseudos:";
			if(data.lang === "en") title = "Names:";

			embed.addField(title, a.join("\n"));

			message.channel.send(embed);
		}).catch(err => {
			if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
			if(data.lang === "en") sendE("An error occurred, try again later...");

			return log(err, "ERROR");
		});
	};
};