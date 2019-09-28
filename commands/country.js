/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const fetch = require("node-fetch");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

module.exports = class country {
	constructor() {
		this.name = "country",
		this.alias = [],
		this.en = "Get infos about an country",
		this.fr = "Donne des informations sur un pays.",
		this.usage = "/country <code>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (text, level) => logger(text, level, bot, __filename);

		let code = args[1];

		if(!code) {
			if(data.lang === "fr") return sendE("Argument 'code' absent. Syntaxe: " + settings.prefix + "country <code>");
			if(data.lang === "en") return sendE("Argument 'code' absent. Syntax:" + settings.prefix + "country <code>");
		};

		let link;

		if(code.length === 3) {
			link = "http://restcountries.eu/rest/v2/alpha/" + code;
		} else {
			link = "http://restcountries.eu/rest/v2/name/" + code + "?fulltext=true";
		};

		fetch(link).then(res => {
			if(!res.ok) {
				if(data.lang === "fr") return sendE("'" + code + "' n'est pas reconnue comme un pays.");
				if(data.lang === "en") return sendE("'" + code + "' is not a country.");
			};

			res.json().then(result => {
				let embed;

				if(data.lang === "fr") {
					embed = new Discord.RichEmbed({
						color: converter.hexToDec(colors.white),
						title: result.name,
						author: {
							icon_url: result.flag,
							name: "Informations sur un Pays"
						},
						thumbnail: {
							url: result.flag
						}
					});
				} else if(data.lang === "en") {

				};

				message.channel.send(embed);
			});
		}).catch(err => {
			if(data.lang === "fr") return sendE("Une erreur est survenue, réessayer plus tard...");
			if(data.lang === "en") return sendE("An error occurred, try again later...");

			log(err, "ERROR");
		});
	};
};