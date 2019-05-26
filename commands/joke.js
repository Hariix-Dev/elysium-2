/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const fetch = require("node-fetch");
const Globals = require("../models/globals");

module.exports = class joke {
	constructor() {
		this.name = "joke",
		this.alias = [],
		this.usage = "/joke";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);
		/*
		if(data.lang === "fr") return sendE("Erreur 404: Aucun humour trouvé!");
		if(data.lang === "en") return sendE("Error 404: Humor module not found!");
		*/

		//TODO: User can save jokes in an general account, accessible on all servers

		if(data.lang === "fr") {
			fetch("https://bridge.buddyweb.fr/api/blagues/blagues").then(res => res.json().then(jokes => {
				let random = Math.floor(Math.random() * (jokes.length + 1));

				let joke = jokes[random].blagues;

				let hex = Math.floor(Math.random() * 16777215).toString(16);

				let embed = new Discord.RichEmbed({
					color: converter.hexToDec(hex),
					description: "**" + joke + "**"
				});

				message.channel.send(embed).then(n => {
					n.react("💾").then(() => {
						bot.on("messageReactionAdd", (reaction, user) => {
							if(reaction.emoji.name === "💾" && reaction.message.id === n.id && user.id !== bot.user.id) {
								Globals.findOne({user_id: user.id}, (err, res) => {
									if(err) return log(err, "ERROR");
	
									res.jokes.push(random);
	
									res.save().then(() => {
										n.react("✅").then(r => {
											r.remove().catch();
										}).catch();
									}).catch(err => log(err, "ERROR"));
								});
							} else return;
						});
					}).catch(err => log(err, "ERROR"));
				});
			})).catch(err => {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
				if(data.lang === "en") sendE("An error occurred, try again later...");

				return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
			});
		} else {
			if(data.lang === "en") {
				return sendE("Error 404: Humor module not found!");
			};
		};
	};
};