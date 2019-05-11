/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
require("dotenv").config();

const { CommandHandler } = require("djs-commands");
const Discord = require("discord.js");
const mongoose = require("mongoose");
const request = require("request");
const chalk = require("chalk");

if(parseInt(process.versions.node.split(".")[0]) < 8) {
	request(process.env.SERVER + "requirements.json", function(err, response, body) {
		let data = JSON.parse(body);
		let versions = data.testedVersions;

		console.error("Vous utiliser une version non supportée de node.js. Version actuelle: " + process.versions.node + ", Versions recommandées: 11.12.0 ou " + versions.join(", "));
	});
};

const converter = require("./modules/hexConverter");
const colors = require("./assets/colors.json");
const config = require("./assets/config.json");
const reply = require("./modules/replyEmbed");
const logger = require("./modules/logger");

const Users = require("./models/users");
const Servers = require("./models/servers");
const Bans = require("./models/bans");
const Globals = require("./models/globals");

const bot = new Discord.Client({
	disableEveryone: false
});

const CH = new CommandHandler({
	folder: __dirname + "/commands/",
	prefix: ["/"]
});

const log = (message, level) => logger(message, level, bot, __filename);

function createServer(guild) {
	if(guild.me.hasPermission("MANAGE_EMOJIS", false, true, true)) {
		let temp;

		temp = guild.emojis.find(temp => temp.name === "elysiumcheck");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/checked.png", "elysiumcheck").catch();

		temp = guild.emojis.find(temp => temp.name === "elysiumcancel");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/cancel.png", "elysiumcancel").catch();
	};

	Servers.findOne({server_id: guild.id}, (err, res) => {
		if(err) log("Une erreur est survenue lors de la recherche du serveur: " + err, "FATAL");

		if(!res) {
			//options must be converted to decimal: https://www.rapidtables.com/convert/number/binary-to-decimal.html
			const newServer = new Servers({
				server_id: guild.id,
				prefix: config.default.prefix,
				lang: config.default.lang,
				money_char: config.default.currency,
				start_money: config.default.money,
				announcements_channel_id: 0,
				music_voice_id: 0,
				options: config.default.options
			});

			newServer.save().catch(err => {
				return log("Une erreur est survenue lors de l'enregistrement du serveur: " + err, "ERROR");
			});
		};
	});
};

bot.on("message", message => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	createServer(message.guild);

	Servers.findOne({server_id: message.guild.id}, (err, res) => {
		if(err) return log("Les paramètres du serveur " + chalk.green("'" + message.guild.id + "'") + " n'ont pas pû être obtenus: " + err, "FATAL");

		if(!res) {
			return message.channel.send(new Discord.RichEmbed({
				title: ":x: Réessayer, s'il vous plaît.",
				description: "La base de données sera prête au prochain message. Une mise à jour est responsable de cette erreur. Il se peux que les données utilisateurs soient aussi supprimée, si tel est le cas le prochain message créera votre compte. Excusez nous pour ce dérangement, cette erreur est rare. Le responsable de ce serveur peux faire une demande de récupération de données, mais rien n'est garanti... Support prioritaire: vincent.bernhardt67@gmail.com",
				color: converter.hexToDec(colors.red)
			}));
		};

		const settings = {
			defaultLang: res.lang,
			prefix: res.prefix,
			currency: res.money_char,
			startMoney: res.start_money,
			announcementsChannel: res.announcements_channel_id,
			musicChannel: res.music_voice_id,
			plugins: res.options
		};

		CH.prefix = settings.prefix;

		Users.findOne({server_id: message.guild.id, user_id: message.author.id}, (err, res) => {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");

			if(!res) {
				const newUser = new Users({
					user_id: message.author.id,
					server_id: message.guild.id,
					lang: settings.defaultLang,
					messages: 0,
					caracters: 0,
					money: settings.startMoney,
					xp: 0,
					level: 0,
					bans: 0,
					kicks: 0,
					perms: []
				});

				return newUser.save().catch(err => {
					return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(message.author.id) + " sur le serveur " + chalk.green(message.guild.id) + ": " + err, "ERROR");
				});
			};

			const args = message.content.split(" ");
			const command = args[0];
			const cmd = CH.getCommand(command);

			const data = {
				lang: res.lang,
				stats: {
					messageSents: res.messages,
					caractersSents: res.caracters,
					money: res.money,
					xp: res.xp,
					level: res.level
				},
				sanctions: {
					bans: res.bans,
					kicks: res.kicks
				},
				perms: res.permissions
			};

			if(!cmd) {
				let reward;

				if(message.content.length >= 200) {
					reward = Math.floor(Math.random() * 22) + 1;
				} else reward = Math.floor(Math.random() * 17) + 1;

				const serial = require("./assets/serial.json");
				const pos = data.stats.level + 1;

				if(data.stats.xp >= serial[pos]) {
					res.level++;

					if(data.lang == "fr") {
						message.channel.send(new Discord.RichEmbed({
							color: converter.hexToDec(colors.blue),
							title: ":bell: " + message.author.username + ", vous passez au niveau **" + pos + "**!"
						}));
					} else {
						if(data.lang == "en") {
							message.channel.send(new Discord.RichEmbed({
								color: converter.hexToDec(colors.blue),
								title: ":bell: " + message.author.username + ", you're going to level **" + pos + "**!"
							}));
						};
					};
				};

				res.xp += reward;
				res.messages++;
				res.caracters += message.content.length;
				
				return res.save().catch(err => {
					return log("La mise à jour du niveau de l'utilisateur '" + message.author.id + "' à échouée sur le serveur '" + message.guild.id + "': " + err, "ERROR");
				});
			} else {
				try {
					cmd.run(bot, message, args, data, settings, mongoose);
				} catch(e) {
					log("La commande à rencontrée un problème:\n" + e, "ERROR");
				};
			};
		});
	});
});

bot.on("ready", () => {
	log("Client prêt et connecté à Discord.", "INFO");

	bot.user.setActivity("Elysium", {
		type: "WATCHING"
	}).catch();

	mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {useNewUrlParser: true}, err => {
		if(err) return log("Une erreur est survenue lors de la connexion à la base de données: " + err, "FATAL");

		log("Base de données connectée avec succés.", "INFO");
	});
});

bot.on("guildMemberAdd", member => {
	Users.findOne({user_id: member.id, server_id: member.guild.id}, (err, res) => {
		if(err) return log("guildMemberAdd: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "ERROR");

		if(!res) {
			let defaultLang;
			let startMoney;

			Servers.findOne({server_id: member.guild.id}, (err, res) => {
				if(err) return log("guildMemberAdd: La langue par défault du serveur n'a pas pû être récupérée: " + err, "ERROR");

				defaultLang = res.lang;
				startMoney = res.start_money;
			});

			const newUser = new Users({
				user_id: member.id,
				server_id: member.guild.id,
				lang: defaultLang,
				messages: 0,
				caracters: 0,
				money: startMoney,
				xp: 0,
				level: 0,
				bans: 0,
				kicks: 0,
				perms: []
			});

			newUser.save().catch(err => {
				return log("guildMemberAdd: Une erreur est survenue lors de la création du compte de " + chalk.green(member.id) + " sur le serveur " + chalk.green(member.guild.id) + ": " + err, "ERROR");
			});
		};
	});
});

bot.on("guildCreate", guild => {
	createServer(guild);
});

/*
bot.on("guildMemberRemove", member => {
	Users.findOneAndDelete({server_id: member.guild.id, user_id: member.id}).catch(err => {
		log("guildMemberRemove: L'utilisateur '" + member.id + "' n'a pas pû être supprimé de la base de données: " + err, "ERROR");
	});
});
*/

bot.on("guildMemberAdd", member => {
	Servers.findOne({server_id: message.guild.id}, (err, res) => {
		if(err) return log("Les paramètres du serveur " + chalk.green("'" + member.guild.id + "'") + " n'ont pas pû être obtenus: " + err, "ERROR");

		if(!res) return createServer(member.guild);

		const settings = {
			defaultLang: res.lang,
			startMoney: res.start_money,
		};

		Users.findOne({server_id: message.guild.id, user_id: message.author.id}, (err, res) => {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");
	
			if(!res) {
				const newUser = new Users({
					user_id: member.id,
					server_id: member.guild.id,
					lang: settings.defaultLang,
					messages: 0,
					caracters: 0,
					money: settings.startMoney,
					xp: 0,
					level: 0,
					bans: 0,
					kicks: 0,
					perms: []
				});
	
				return newUser.save().catch(err => {
					return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(member.id) + " sur le serveur " + chalk.green(member.guild.id) + ": " + err, "ERROR");
				});
			};
		});
	});
});

bot.on("guildBanAdd", (guild, user) => {
	Users.findOne({user_id: user.id, server_id: guild.id}, (err, res) => {
		if(err) return log("guildBanAdd: Le nombre de bans de l'utilisateur '" + user.id + "' n'a pas pû être mis à jour sur '" + guild.id + "': " + err, "ERROR");

		res.bans++;

		return res.save().catch(err => {
			log("guildBanAdd: Le nombre de bans de l'utilisateur '" + user.id + "' n'a pas pû être sauvegardé sur '" + guild.id + "': " + err, "ERROR");
		});
	});
});

bot.login(process.env.TOKEN).catch(err => {
	return log("La tentative de connection a échouée: " + err, "FATAL");
});