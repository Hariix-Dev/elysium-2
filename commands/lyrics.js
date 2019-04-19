/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");
const request = require("request");
const logger = require("../modules/logger");

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
		let title = args.join("%20");

		let link = "https://some-random-api.ml/lyrics?title=" + title;

		request(link, function(err, response, body) {
			if(err || response.statusCode !== 200) {
				if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard... HTTP: " + response.statusCode);
				if(data.lang === "en") sendE("An error occurred, try again later... HTTP: " + response.statusCode);

				return log("Code: " + response.statusCode + ", Erreur: " + err, "ERROR");
			};

			let embed;
			let d = JSON.parse(body);
			let multipart = [];
			let lyric = d.lyrics;

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
							value: d.title,
							inline: true
						},
						{
							name: "Auteur",
							value: d.author,
							inline: true
						},
						{
							name: "Source",
							value: d.links.genius,
							inline: false
						}
					],
					thumbnail: {
						url: d.thumbnail.genius
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
								value: d.title,
								inline: true
							},
							{
								name: "Author",
								value: d.author,
								inline: true
							},
							{
								name: "Link",
								value: d.links.genius,
								inline: false
							}
						],
						thumbnail: {
							url: d.thumbnail.genius
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
						setTimeout(function() {
							temp.delete().catch();
						}, 300000);
					}).catch();
				});
			}).catch();
		});
	};
};