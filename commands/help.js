/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed.js");
const fs = require("fs");
const logger = require("../modules/logger");

module.exports = class help {
	constructor() {
		this.name = "help",
		this.alias = ["h"],
		this.en = "Send this message.",
		this.fr = "Montre ceci.",
		this.usage = "/help <page>";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);
		fs.readdirSync("./commands/").forEach(file => {
			let temp = require("./" + file);
			let cmd = new temp();
			log(cmd.name);
		});
	};
};