/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");

module.exports = class avatar {
	constructor() {
		this.name = "avatar",
		this.alias = [],
		this.usage = "/avatar [@user]";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		let title;
		let description;
		let embed;

		switch(args.length) {
			case 1:
				if(data.lang === "fr") title = "Voici votre avatar:";
				if(data.lang === "en") title = "Here is your avatar:";

				if(data.lang === "fr") description = "[Lien du fichier](" + message.author.avatarURL + ")";
				if(data.lang === "en") description = "[Link to the file](" + message.author.avatarURL + ")";

				embed = new Discord.RichEmbed({
					color: converter.hexToDec(colors.darkGreen),
					title: title,
					image: {
						url: message.author.avatarURL
					},
					description: description
				});

				message.channel.send(embed).catch();
			break;

			case 2:
				let aUser = message.mentions.users.first();

				if(!aUser) {
					if(data.lang === "fr") return sendE("Argument '@user' absent ou invalide. Syntaxe: " + settings.prefix + "avatar <@user>");
					if(data.lang === "en") return sendE("Argument '@user' absent or invalid. Syntax:" + settings.prefix + "avatar <@user>");
				};

				if(data.lang === "fr") title = "Voici votre avatar:";
				if(data.lang === "en") title = "Here is your avatar:";

				if(data.lang === "fr") description = "[Lien du fichier](" + aUser.avatarURL + ")";
				if(data.lang === "en") description = "[Link to the file](" + aUser.avatarURL + ")";

				embed = new Discord.RichEmbed({
					color: converter.hexToDec(colors.darkGreen),
					title: title,
					image: {
						url: aUser.avatarURL
					},
					description: description
				});

				message.channel.send(embed).catch();
			break;
		
			default:
				if(data.lang === "fr") return sendE("Arguments invalides. Syntaxe: " + settings.prefix + "avatar <@user>");
				if(data.lang === "en") return sendE("Arguments invalids. Syntax:" + settings.prefix + "avatar <@user>");
			break;
		};
	};
};