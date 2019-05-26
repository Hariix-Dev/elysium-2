/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
require("dotenv").config();

const Discord = require("discord.js");
const fetch = require("node-fetch");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");

module.exports = class yt {
	constructor() {
		this.name = "youtube",
		this.alias = ["yt"],
		this.usage = "/youtube <id>";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		args.shift();

		const link = "https://www.googleapis.com/youtube/v3/videos?part=id%2C+snippet&id=" + args + "&key=" + process.env.YOUTUBE;

		fetch(link).then(res => res.json().then(result => {
			let video = result.items[0];

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.red),
				thumbnail: {
					url: video.snippet.thumbnails.maxres.url
				},
				video: {
					url: "https://www.youtube.com/watch?v=" + video.id
				},
				title: video.snippet.title,
				url: "https://www.youtube.com/watch?v=" + video.id,
				description: video.snippet.description,
				fields: [
					{
						name: "Channel",
						value: video.snippet.channelTitle
					},
					{
						name: "Tags",
						value: "||" + video.snippet.tags.join(", ") + "||"
					}
				]
			});

			if(data.lang === "fr") embed.setAuthor("Informations sur une vidéo", process.env.SERVER + "assets/thumbnails/youtube.png");
			if(data.lang === "en") embed.setAuthor("Information about a video", process.env.SERVER + "assets/thumbnails/youtube.png");

			message.channel.send(embed).catch();
		})).catch(err => {
			log(err, "ERROR");

			if(data.lang === "fr") return sendE("Une erreur est survenue lors de l'appel à l'API de Youtube.");
			if(data.lang === "en") return sendE("An error occurred when calling the Youtube API.");
		});
	};
};