/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
/* jshint -W061*/
const config = require("../assets/config.json");
const reply = require("../modules/replyEmbed");

module.exports = class evalc {
	constructor() {
		this.name = "eval",
		this.alias = [],
		this.en = "owo",
		this.fr = "owo",
		this.usage = "/eval <code>";
	};

	run(bot, message, args, data, settings, db) {
		if(message.author.id !== config.ownerId) return;

		const logger = require("../modules/logger");
		const converter = require("../modules/hexConverter");
		const bin = require("../modules/binConverter");
		const dir = require("../modules/data");
		const fs = require("fs");
		const Discord = require("discord.js");
		const Users = require("../models/users");
		const Globals = require("../models/globals");
		const Servers = require("../models/servers");
		const Bans = require("../models/bans");

		const log = (text, level) => logger(text, level, bot, __filename);

		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		args.shift();
		const code = args.join(" ");

		const clean = (text) => {
			if(typeof(text) === "string") {
				return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			} else return text;
		};

		try {
			let evaled = eval(code);

			if(typeof(evaled) !== "string") evaled = require("util").inspect(evaled);
			let multipart = [];
			const cleaned = clean(evaled);

			for(let i = 0; i < cleaned.length; i += 1950) {
				const content = cleaned.toString().slice(i, i + 1950);
				multipart.push(content);
			};

			multipart.forEach(value => {
				message.channel.send(value, {code: "xl"}).catch();
			});
		} catch(err) {
			return sendE("```xl" + clean(err) + "```");
		};
	};
};