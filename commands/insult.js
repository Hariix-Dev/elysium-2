/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const logger = require("../modules/logger");
const request = require("request");

module.exports = class insult {
	constructor() {
		this.name = "insult",
		this.alias = ["clash"],
		this.usage = "/insult";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		var log = (txt, level) => logger(txt, level, bot, __filename);

		request(link, (err, res, body) => {

		});
	};
};