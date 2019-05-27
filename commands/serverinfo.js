/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const Servers = require("../models/servers");
const logger = require("../modules/logger");

module.exports = class serverinfo {
	constructor() {
		this.name = "serverinfo",
		this.alias = ["serverinfos", "si"],
		this.usage = "/serverinfo";
	};

	run(bot, message, args, data, settings, db) {
		const log = (text, level) => logger(text, level, bot, __filename);

		let embed = new Discord.RichEmbed({
			color: converter.hexToDec(colors.blue),
			author: {
				name: message.guild.name,
				icon_url: message.guild.iconURL
			},
			thumbnail: message.guild.iconURL,
			timestamp: Date.now(),
			footer: {
				text: message.author.tag,
				icon_url: message.author.iconURL
			}
		});

		Servers.findOne({server_id: message.guild.id}, (err, res) => {
			if(err) return log(err, "ERROR");

			if(data.lang === "fr") {
				embed.addField("Fondateur", message.guild.owner.id, true).addField("Region", message.guild.region, true).addField("Salons textuels", message.guild.channels.filter(c => c.type === "text").size, true).addField("Catégories", message.guild.channels.filter(c => c.type === "category").size, true).addField("Salons vocaux", message.guild.channels.filter(c => c.type === "voice").size, true).addField("Membres", message.guild.members.filter(u => u.bot));
			};

			if(data.lang === "en") {

			};

			message.channel.send(embed);
		});
	};
};