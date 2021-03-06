/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const fetch = require("node-fetch");
const logger = require("../modules/logger");
const Discord = require("discord.js");

module.exports = class wasted {
	constructor() {
		this.name = "wasted",
		this.alias = [],
		this.en = "Apply an effect on an image.",
		this.fr = "Applique un effet sur une image.",
		this.usage = "/wasted [url]";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		if(args.length > 1) {
			args.shift();
		} else {
			args = message.author.avatarURL;
		};

		let embed = new Discord.RichEmbed({
			title: "Link",
			image: {
				url: "https://some-random-api.ml/beta/wasted?avatar=" + args
			},
			url: "https://some-random-api.ml/beta/wasted?avatar=" + args
		});

		message.channel.send(embed);
	};
};