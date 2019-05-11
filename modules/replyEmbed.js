/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const colors = require("../assets/colors.json");
const hexToDec = require("../modules/hexConverter");

/**
 *
 *
 * @param {*} text
 * @param {*} timeout
 * @param {*} message
 */

exports.sendError = function(text, message, timeout) {
	var temp = message.guild.emojis.find(temp => temp.name === "elysiumcancel");
	var rEmbed;
	var color = hexToDec.hexToDec(colors.red);

	if(!temp) {
		if(text.length >= 255) {
			rEmbed = new Discord.RichEmbed({
				color: color,
				description: ":x: " + text
			});
		} else {
			rEmbed = new Discord.RichEmbed({
				color: color,
				title: ":x: " + text
			});
		};
	} else {
		if(text.length >= 255) {
			rEmbed = new Discord.RichEmbed({
				color: color,
				description: `<:elysiumcancel:${temp.id}> ${text}`
			});
		} else {
			rEmbed = new Discord.RichEmbed({
				color: color,
				title: `<:elysiumcancel:${temp.id}> ${text}`
			});
		};
	};

	message.channel.send(rEmbed).then(c => {
		//timeout is in sec
		if(timeout) {
			var timer = timeout * 1000; //I'm idiot!

			setTimeout(function() {
				c.delete().catch();
			}, timer);
		};
	}).catch();
};

exports.sendConfirm = function(text, message, timeout) {
	var temp = message.guild.emojis.find(temp => temp.name === "elysiumcheck");
	var rEmbed;
	var color = hexToDec.hexToDec(colors.green);

	if(!temp) {
		if(text.length >= 255) {
			rEmbed = new Discord.RichEmbed({
				color: color,
				description: ":white_check_mark: " + text
			});
		} else {
			rEmbed = new Discord.RichEmbed({
				color: color,
				title: ":white_check_mark: " + text
			});
		};
	} else {
		if(text.length >= 255) {
			rEmbed = new Discord.RichEmbed({
				color: color,
				description: `<:elysiumcheck:${temp.id}> ${text}`
			});
		} else {
			rEmbed = new Discord.RichEmbed({
				color: color,
				title: `<:elysiumcheck:${temp.id}> ${text}`
			});
		};
	};

	message.channel.send(rEmbed).then(c => {
		//timeout is in sec
		if(timeout) {
			var timer = timeout * 1000; //I'm idiot!

			setTimeout(function() {
				c.delete().catch();
			}, timer);
		};
	}).catch();
};