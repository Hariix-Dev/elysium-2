//https://github.com/PokeAPI/pokedex-promise-v2
/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const api = require("some-random-api");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");

module.exports = class pokedex {
	constructor() {
		this.name = "pokedex",
		this.alias = [],
		this.usage = "/pokedex";
	};

	run(bot, message, args, data, settings, db) {
		
	};
};