/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const colors = require("../assets/colors.json");
const converter = require("../modules/hexConverter");
const file = require("../modules/data");
const infos = require("../package.json");
const fs = require("fs");

module.exports = class info {
	constructor() {
		this.name = "info",
		this.alias = ["bot", "infos", "i"],
		this.en = "Get somes infos about the bot.",
		this.fr = "Donne des informations sur le bot.",
		this.usage = "/info";
	};

	run(bot, message, args, data, settings, db) {
		const version = infos.version;
		const arch = process.arch;
		const platform = process.platform;
		const node = process.versions.node;
		const servers = bot.guilds.size;
		const users = bot.users.size;
		const size = fs.readdirSync("../");

		let embed;

		if(data.lang === "fr") {
			embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.purple),
				author: {
					name: "Informations",
					icon_url: bot.user.avatarURL
				},
				fields: [
					{
						name: "Version",
						value: version,
						inline: true
					},
					{
						name: "Architecture",
						value: platform + " (" + arch + ")",
						inline: true
					},
					{
						name: "Lib",
						value: "Node.js " + node,
						inline: true
					},
					{
						name: "Serveurs",
						value: servers,
						inline: true
					},
					{
						name: "Utilisateurs",
						value: users,
						inline: true
					},
					{
						name: "** **",
						value: "** **",
						inline: true
					},
					{
						name: "Créateur",
						value: infos.author.discord + "\n" + infos.author.email,
						inline: true
					},
					{
						name: "Source",
						value: "https://github.com/Hariix-Dev/elysium-2",
						inline: true
					}
				]
			});
		} else {
			if(data.lang === "en") {
				embed = new Discord.RichEmbed({
					color: converter.hexToDec(colors.purple),
					author: {
						name: "Informations",
						icon_url: bot.user.avatarURL
					},
					fields: [
						{
							name: "Version",
							value: version,
							inline: true
						},
						{
							name: "Architecture",
							value: platform + " (" + arch + ")",
							inline: true
						},
						{
							name: "Lib",
							value: "Node.js " + node,
							inline: true
						},
						{
							name: "Servers",
							value: servers,
							inline: true
						},
						{
							name: "Users",
							value: users,
							inline: true
						},
						{
							name: "** **",
							value: "** **",
							inline: true
						},
						{
							name: "Creator",
							value: infos.author.discord + "\n" + infos.author.email,
							inline: true
						},
						{
							name: "Source",
							value: "https://github.com/Hariix-Dev/elysium-2",
							inline: true
						}
					]
				});
			};
		};

		message.channel.send(embed);
	};
};