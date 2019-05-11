/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const api = require("some-random-api");
const Discord = require("some-random-api");

module.exports = class dico {
	constructor() {
		this.name = "def",
		this.alias = ["dico", "dictionary"],
		this.usage = "/def <word>";
	};

	run(bot, message, args, data, settings, db) {
		
	};
};