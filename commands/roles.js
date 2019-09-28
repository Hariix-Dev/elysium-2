/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");

module.exports = class roles {
	constructor() {
		this.name = "roles",
		this.alias = [],
		this.en = "Get roles of an user.",
		this.fr = "Donne la list de roles d'un utilisateur.",
		this.usage = "/roles";
	};

	run(bot, message, args, data, settings, db) {
		let numberRoles = message.guild.roles.size;
		let rolesList = message.guild.roles.map(r => r.name).join("\n- ");
		rolesList = rolesList.replace("@everyone", "");

		let embed;

		if(data.lang === "fr") {
			embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.black),
				title: numberRoles + " roles:",
				author: {
					icon_url: message.guild.iconURL,
					name: "Listes des roles:"
				},
				description: rolesList
			});
		} else {
			if(data.lang === "en") {
				embed = new Discord.RichEmbed({
					color: converter.hexToDec(colors.black),
					title: numberRoles + " roles:",
					author: {
						icon_url: message.guild.iconURL,
						name: "Roles:"
					},
					description: rolesList
				});
			};
		};

		message.channel.send(embed);
	};
};