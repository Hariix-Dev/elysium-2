/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");

module.exports = class test {
	constructor() {
		this.name = "get",
		this.alias = ["show"],
		this.usage = "/get <var>";
	};

	run(bot, message, args, data, settings, db) {
		if(args.length == 2) {
			switch(args[1]) {
				case "prefix":
					if(data.lang == "fr") return message.channel.send("Le préfixe des commandes du serveur est ``" + settings.prefix + "``.");
					if(data.lang == "en") return message.channel.send("The prefix for server commands is ``" + settings.prefix + "``.");
				break;

				case "defaultLang":
					if(data.lang == "fr") return message.channel.send("La langue par défaut pour le serveur est ``" + settings.defaultLang + "``.");
					if(data.lang == "en") return message.channel.send("The default language for the server is ``" + settings.defaultLang + "``.");
				break;

				default: return;
			};
		};
	};
};