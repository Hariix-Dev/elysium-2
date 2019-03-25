/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");

module.exports = class test {
	constructor() {
		this.name = "test",
		this.alias = [],
		this.usage = "/test";
	};

	run(bot, message, args, data, settings) {
		message.reply("ok!");
	};
};