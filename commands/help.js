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

		/**let list = [];

		fs.readdirSync("./commands/").forEach(file => {
			let temp = require("./" + file);
			let cmd = new temp();

			list.push({
				usage: cmd.usage,
				fr: cmd.fr,
				en: cmd.en
			});
		});

		let pages = [{}];
		let x = 0;
		let p = 1;

		list.forEach(e => {
			if(x >= 6) {p++; x = 0};
			if(data.lang === "en") pages[p] = e.usage + e.en;
			if(data.lang === "fr") pages[p] = e.usage + e.fr;
			
			x++;
		});

		log(pages[1]);
		*/

		
	};
};