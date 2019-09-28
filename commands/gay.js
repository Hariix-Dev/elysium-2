/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const fetch = require("node-fetch");
const logger = require("../modules/logger");
const Discord = require("discord.js");

module.exports = class gay {
	constructor() {
		this.name = "gay",
		this.alias = [],
		this.en = "Apply an rambow to an image.",
		this.fr = "Applique un effet sur une image.",
		this.usage = "/gay [url]";
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
				url: "https://some-random-api.ml/beta/gay?avatar=" + args
			},
			url: "https://some-random-api.ml/beta/gay?avatar=" + args
		});

		message.channel.send(embed);
	};
};