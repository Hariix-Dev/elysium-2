/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const api = require("some-random-api");

module.exports = class lyrics {
	constructor() {
		this.name = "lyrics",
		this.alias = ["lyric"],
		this.usage = "/lyrics <title>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		args.shift();

		api.lyrics(args).then(lyrics => {
			let embed;
			let multipart = [];
			let lyric = lyrics.lyrics;

			message.channel.startTyping();

			for(var i = 0; i < lyric.length; i += 2000) {
				var content = lyric.toString().slice(i, i + 2000);
				multipart.push(content);
			};

			if(data.lang === "fr") {
				embed = new Discord.RichEmbed({
					color: converter.hexToDec(colors.yellow),
					fields: [
						{
							name: "Titre",
							value: lyrics.title,
							inline: true
						},
						{
							name: "Auteur",
							value: lyrics.author,
							inline: true
						},
						{
							name: "Source",
							value: lyrics.links.genius,
							inline: false
						}
					],
					thumbnail: {
						url: lyrics.thumbnail.genius
					},
					author: {
						icon_url: process.env.SERVER + "assets/thumbnails/music-player.png",
						name: "Recherche de '" + args.join(" ") + "'",
					}
				});
			} else {
				if(data.lang === "en") {
					embed = new Discord.RichEmbed({
						color: converter.hexToDec(colors.yellow),
						fields: [
							{
								name: "Title",
								value: lyrics.title,
								inline: true
							},
							{
								name: "Author",
								value: lyrics.author,
								inline: true
							},
							{
								name: "Link",
								value: lyrics.links.genius,
								inline: false
							}
						],
						thumbnail: {
							url: lyrics.thumbnail.genius
						},
						author: {
							icon_url: process.env.SERVER + "assets/thumbnails/music-player.png",
							name: "Search for '" + args.join(" ") + "'",
						}
					});
				};
			};

			message.channel.send(embed).then(() => {
				multipart.forEach(lyrics => {
					let base = new Discord.RichEmbed({
						color: converter.hexToDec(colors.yellow),
						description: lyrics
					});

					message.channel.send(base).then(temp => {
						message.channel.stopTyping();

						setTimeout(function() {
							temp.delete().catch();
						}, 300000);
					}).catch();
				});
			}).catch();
		}).catch(err => {
			if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
			if(data.lang === "en") sendE("An error occurred, try again later...");

			return log(err, "ERROR");
		});
	};
};