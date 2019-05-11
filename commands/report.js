/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
require("dotenv").config();

const mongoose = require("mongoose");
const Reports = require("../models/reports");
const converter = require("../modules/hexConverter");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const Discord = require("discord.js");

module.exports = class report {
	constructor() {
		this.name = "report",
		this.alias = ["rep"],
		this.usage = "/report <@user> <reason>";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (text, level) => logger(text, level, bot, __filename);

		if(args.length !== 1) {
			args.shift();
			const rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
			const reason = args.join(" ").slice(22);

			if(!rUser) {
				if(data.lang === "fr") return sendE("Je n'ai pas trouvée cette utilisateur.", 60);
				if(data.lang === "en") return sendE("Couldn't find this user.", 60);
			};

			if(rUser.id === message.author.id) {
				if(data.lang === "fr") return sendE("Vous ne pouvez pas vous reporter vous même.", 60);
				if(data.lang === "en") return sendE("You can't report yourself.", 60);
			};

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec("F49842"),
				author: {
					icon_url: process.env.SERVER + "assets/thumbnails/justice.png",
					name: "Report " + rUser.username
				},
				thumbnail: {
					url: rUser.avatarUrl
				}
			});
		} else {
			if(data.lang === "fr") return sendE("Argument 'user' et 'reason' absents. Syntaxe: " + settings.prefix + "report <@user> <reason>");
			if(data.lang === "en") return sendE("Argument 'user' and 'reason' absents. Syntax:" + settings.prefix + "report <@user> <reason>");
		};
	};
};