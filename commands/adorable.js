/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");

module.exports = class adorable {
	constructor() {
		this.name = "adorable",
		this.alias = ["ad"],
		this.usage = "/adorable [id]";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		let id;
		if(args.length === 1) {
			id = message.author.id;
		} else {
			args.shift();
			id = args.join("%20");
		};
		
		let link = "https://api.adorable.io/avatars/285/" + id + ".png";

		let description;

		if(data.lang === "fr") description = "> [Lien du fichier](" + link + ")";
		if(data.lang === "en") description = "> [Link to the file](" + link + ")";

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.darkGreen),
			description: description,
			image: {
				url: link
			}
		});

		message.channel.send(embed);
	};
};