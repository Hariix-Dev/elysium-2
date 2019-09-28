/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const reply = require("../modules/replyEmbed");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const fetch = require("node-fetch");
const Globals = require("../models/globals");

module.exports = class memes {
	constructor() {
		this.name = "memes",
		this.alias = ["meme"],
		this.en = "Give somes reddits memes.",
		this.fr = "Donnes des memes de reddits.",
		this.usage = "/memes";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (txt, timeout) => reply.sendError(txt, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		let hex = Math.floor(Math.random() * 16777215).toString(16);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(hex)
		});

		const subreddits = ["memes", "dankmemes", "meirl", "me_irl"];
		const randomtopic = Math.floor(Math.random() * subreddits.length);

		fetch("https://www.reddit.com/r/" + subreddits[randomtopic] + "/top.json").then(res => res.json().then(body => {
			const meme = body.data.children.filter(post => !post.data.over_18 || !post.data.pinned);
			const randommeme = Math.floor(Math.random() * meme.length);
			const m = meme[randommeme].data;

			embed.setImage(m.url).setTitle(m.title).setURL(m.url).setFooter("👍 " + m.ups + " | 💬 " + m.num_comments + " | " + m.subreddit_name_prefixed);

			message.channel.send(embed).then(n => {
				n.react("💾").then(() => {
					bot.on("messageReactionAdd", (reaction, user) => {
						if(reaction.emoji.name === "💾" && reaction.message.id === n.id && user.id !== bot.user.id) {
							Globals.findOne({user_id: user.id}, (err, res) => {
								if(err) return log(err, "ERROR");

								if(!res.memes.includes(m.url)) {
									res.memes.push(m.url);

									res.save().then(() => {
										n.react("✅").then(r => {
											r.remove().catch();
										}).catch();
									}).catch(err => log(err, "ERROR"));
								} else {
									n.react("❌").then(r => {
										r.remove().catch();
									}).catch();
								};
							});
						} else return;
					});
				}).catch(err => log(err, "ERROR"));
			});
		})).catch(err => {
			if(data.lang === "fr") sendE("Une erreur est survenue, réessayer plus tard...");
			if(data.lang === "en") sendE("An error occurred, try again later...");
	
			return log(err, "ERROR");
		});
	};
};