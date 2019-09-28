/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Globals = require("../models/globals");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const fetch = require("node-fetch");

module.exports = class sav {
	constructor() {
		this.name = "sav",
		this.alias = ["saved"],
		this.en = "Show saved memes and jokes.",
		this.fr = "Montres vos blagues et memes sauvegardées.",
		this.usage = "/sav <type: memes, jokes>";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.pink)
		});

		Globals.findOne({user_id: message.author.id}, (err, res) => {
			if(err || !res) {
				log(err, "ERROR");

				if(data.lang === "fr") return sendE("Je n'ai pas pu lire les données de votre compte global.");
				if(data.lang === "en") return sendE("I couldn't read the data from your global account.");
			};

			if(args.length === 2) {
				if(args[1] === "meme" || args[1] === "memes" || args[1] === "m") {
					if(data.lang === "fr") embed.setTitle("Voici vos memes favoris").setDescription("Vous avez sauvegardés " + res.memes.length + " memes.");
					if(data.lang === "en") embed.setTitle("Here are your favorites memes").setDescription("You have saved " + res.memes.length + " memes.");

					let id = 0;

					if(res.memes.length === 0) {
						message.channel.send(embed);
					} else if(res.memes.length === 1) {
						embed.setImage(res.memes[id]);
						message.channel.send(embed);
					} else {
						embed.setImage(res.memes[id]);

						message.channel.send(embed).then(n => {
							n.react("◀").then(() => {
								n.react("▶").then(() => {
									const pfilter = (reaction, user) => reaction.emoji.name === "◀" && user.id === message.author.id;
									const p = new Discord.ReactionCollector(n, pfilter);
									const nfilter = (reaction, user) => reaction.emoji.name === "▶" && user.id === message.author.id;
									const next = new Discord.ReactionCollector(n, nfilter);
				
									p.on("collect", t => {
										if(id !== 0) {
											id--;

											embed.setImage(res.memes[id]);
											if(data.lang === "fr") embed.setDescription("Vous avez sauvegardés " + res.memes.length + " memes. **" + (id + 1) + "/" + res.memes.length + "**");
											if(data.lang === "en") embed.setDescription("You have saved " + res.memes.length + " memes. **" + (id + 1) + "/" + res.memes.length + "**");

											n.edit(embed).catch();
										};

										t.remove(message.author).catch();
									});
				
									next.on("collect", t => {
										if(res.memes[id + 1]) {
											id++;

											embed.setImage(res.memes[id]);
											if(data.lang === "fr") embed.setDescription("Vous avez sauvegardés " + res.memes.length + " memes. **" + (id + 1) + "/" + res.memes.length + "**");
											if(data.lang === "en") embed.setDescription("You have saved " + res.memes.length + " memes. **" + (id + 1) + "/" + res.memes.length + "**");

											n.edit(embed).catch();
										};

										t.remove(message.author).catch();
									});
								}).catch();
							}).catch();
						}).catch();
					};
				} else if(args[1] === "joke" || args[1] === "jokes" || args[1] === "j") {
					fetch("https://bridge.buddyweb.fr/api/blagues/blagues").then(dt => dt.json().then(body => {
						let d = "";

						if(data.lang === "fr") embed.setTitle("Voici vos blagues favorites");
						if(data.lang === "en") embed.setTitle("Here are your favorites memes");

						res.jokes.forEach(j => {
							d += "> " + body[j].blagues + "\n";
						});

						embed.setDescription("**" + d + "**");

						message.channel.send(embed).catch();
					})).catch(err => {
						log(err, "ERROR");

						if(data.lang === "fr") return sendE("Je n'ai pas pu récupérer les blagues sur le serveur.");
						if(data.lang === "en") return sendE("I couldn't get the jokes back from the server.");
					});
				} else {
					if(data.lang === "fr") return sendE("Argument 'type' invalide. Syntaxe: " + settings.prefix + "sav <type: memes, jokes>");
					if(data.lang === "en") return sendE("Invalid 'type' argument. Syntax: " + settings.prefix + "sav <type: memes, jokes>");
				};
			} else {
				if(data.lang === "fr") return sendE("Argument 'type' absent. Syntaxe: " + settings.prefix + "sav <type: memes, jokes>");
				if(data.lang === "en") return sendE("Absent 'type' argument. Syntax: " + settings.prefix + "sav <type: memes, jokes>");
			};
		});
	};
};