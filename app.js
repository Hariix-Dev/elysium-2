/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/

//https://github.com/visionmedia/node-progress PROGRESS BAR

require("dotenv").config();

const { CommandHandler } = require("djs-commands");
const hexToDec = require("./modules/hexConverter");
const Discord = require("discord.js");
const request = require("request");
const sparkly = require("sparkly");
const chalk = require("chalk");
const mysql = require("mysql");

const config = require("./assets/config.json");
const converter = require("./modules/data");
const logger = require("./modules/logger");
const reply = require("./modules/replyEmbed");
const colors = require("./assets/colors.json");

if(parseInt(process.versions.node.split(".")[0]) < 8) {
	request(process.env.SERVER + "requirements.json", function(err, response, body) {
		var data = JSON.parse(body);
		var versions = data.testedVersions;

		console.error("Vous utiliser une version non supportée de node.js. Version actuelle: " + process.versions.node + ", Versions recommandées: 11.12.0 ou " + versions.join(", "));
	});
};

const bot = new Discord.Client({
	disableEveryone: true
});

const CH = new CommandHandler({
	folder: __dirname + "/commands/",
	prefix: ["/"]
});

var db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	timezone: "Europe/Paris",
	charset: config.encode,
	typeCast: true,
	debug: false,
	supportBigNumbers: true
});

var queued = {};

const log = (message, level) => logger(message, level, bot, __filename);

function createServer(guild) {
	if(guild.me.hasPermission("MANAGE_EMOJIS", false, true, true)) {
		var temp;

		temp = guild.emojis.find(temp => temp.name === "elysiumcheck");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/checked.png", "elysiumcheck").catch();

		temp = guild.emojis.find(temp => temp.name === "elysiumcancel");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/cancel.png", "elysiumcancel").catch();
	};

	db.query("SELECT server_id FROM servers_settings WHERE server_id = " + guild.id + ";", function(err, result, fields) {
		if(err) log("Une erreur est survenue lors de la recherche du serveur: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].server_id)) {
			//options must be converted to decimal: https://www.rapidtables.com/convert/number/binary-to-decimal.html
			db.query(`INSERT INTO servers_settings VALUES (${guild.id}, '${config.default.prefix}', '${config.default.lang}', '${config.default.currency}', ${config.default.money}, 0, ${config.default.options});`, function(err, result, fields) {
				if(err) return log("Une erreur est survenue lors de l'enregistrement du serveur: " + err, "ERROR");
			});
		};
	});
};

db.init = function() {

	/**
	 * prefix: 5 caractères max,
	 * money_char: 2 caractères max,
	 * start_money: 0 à 4294967295,
	 * announcements_channel_id: 0 à 18446744073709551615,
	 * options: 0 à 16777215,
	 */

	db.query("CREATE TABLE IF NOT EXISTS servers_settings (server_id BIGINT UNSIGNED NOT NULL, prefix VARCHAR(5) NOT NULL, lang CHAR(2) NOT NULL, money_char VARCHAR(3) NOT NULL, start_money INT UNSIGNED NOT NULL, announcements_channel_id BIGINT UNSIGNED NOT NULL, options MEDIUMINT UNSIGNED NOT NULL, PRIMARY KEY (server_id)) ENGINE = INNODB;", function(err, result, fields) {
		if(err) return log("La table " + chalk.green("'servers_settings'") + " n'a pas pû être créé: " + err, "FATAL");
		log("La table " + chalk.green("'servers_settings'") + " à été vérifiée.", "INFO");
	});

	/**
	 * lang: 2 caractères,
	 * messages: 0 à 18446744073709551615,
	 * caracters: 0 à 18446744073709551615,
	 * money: 0 à 18446744073709551615,
	 * xp: 0 à 16777215,
	 * level: 0 à 65535,
	 * bans: 0 à 65535,
	 * kicks: 0 à 65535,
	 */

	db.query("CREATE TABLE IF NOT EXISTS users (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, server_id BIGINT UNSIGNED NOT NULL, lang VARCHAR(2) NOT NULL, messages BIGINT UNSIGNED NOT NULL, caracters BIGINT UNSIGNED NOT NULL, money BIGINT UNSIGNED NOT NULL, xp INT UNSIGNED NOT NULL, level SMALLINT UNSIGNED NOT NULL, bans SMALLINT UNSIGNED NOT NULL, kicks SMALLINT UNSIGNED NOT NULL, PRIMARY KEY (id)) ENGINE = INNODB;", function(err, result, fields) {
		if(err) return log("La table " + chalk.green("'users'") + " n'a pas pû être créé: " + err, "FATAL");
		log("La table " + chalk.green("'users'") + " à été vérifiée.", "INFO");
	});

	/**
	 * banned_at: DATETIME,
	 * revoke_at: DATETIME,
	 * admin_id: 0 à 18446744073709551615,
	 * reason: 255 caractères max,
	 */

	db.query("CREATE TABLE IF NOT EXISTS bans (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, server_id BIGINT UNSIGNED NOT NULL, banned_at DATETIME NOT NULL, revoke_at DATETIME NOT NULL, admin_id BIGINT UNSIGNED NOT NULL, reason VARCHAR(255), PRIMARY KEY (id)) ENGINE = INNODB;", function(err, result, fiels) {
		if(err) return log("La table " + chalk.green("'bans'") + " n'a pas pû être créé: " + err, "FATAL");
		log("La table " + chalk.green("'bans'") + " à été vérifiée.", "INFO");
	});
};

bot.on("message", message => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	createServer(message.guild);

	var sendE = (text, timeout) => reply.sendError(text, message, timeout);
	var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

	if(message.channel.id == config.logId && message.author.id == config.ownerId) {
		if(message.content.startsWith(">") && message.content.endsWith(";")) {
			var query = message.content.slice(1);
			
			db.query(query, function(err, result, fields) {
				if(err) return sendE(err);
				if(!result) return sendE("Pas de données renvoyées.");

				return message.channel.send("||" + JSON.stringify(result) + "||");
			});
		};
	};

	db.query("SELECT prefix, lang, money_char, start_money, announcements_channel_id, options FROM servers_settings WHERE server_id = '" + message.guild.id + "';", function(err, result, fields) {
		if(err) return log("Les paramètres du serveur " + chalk.green("'" + message.guild.id + "'") + " n'ont pas pû être obtenus: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].prefix) || (!result[0].lang)) return message.channel.send(new Discord.RichEmbed({
			title: ":x: Veuillez patienter, s'il vous plaît.",
			description: "La base de données sera prête au prochain message. Une mise à jour est responsable de cette erreur. Il se peux que les données utilisateurs soient aussi supprimée, si tel est le cas le prochain message créera votre compte. Excusez nous pour ce dérangement, cette erreur est rare. Le responsable de ce serveur peux faire une demande de récupération de données, mais rien n'est garanti... Support prioritaire: vincent.bernhardt67@gmail.com",
			color: hexToDec.hexToDec(colors.red)
		}));

		var settings = {
			defaultLang: result[0].lang,
			prefix: result[0].prefix,
			currency: result[0].money_char,
			startMoney: result[0].start_money,
			announcementsChannel: result[0].announcements_channel_id,
			plugins: result[0].options
		};

		CH.prefix = settings.prefix;

		db.query("SELECT id, lang, messages, caracters, money, xp, level, bans, kicks FROM users WHERE user_id = " + message.author.id + " AND server_id = " + message.guild.id + ";", function(err, result, fields) {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");
	
			if((!result) || (!result[0]) || (!result[0].id) || (!result[0].lang)) {
				db.query("INSERT INTO users VALUES (null, " + message.author.id + ", " + message.guild.id + ", '" + settings.defaultLang + "', 0, 0, " + settings.startMoney + ", 0, 0, 0, 0)", function(err, result, fields) {
					if(err) return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(message.author.id) + " sur le serveur " + chalk.green(message.guild.id) + ": " + err, "ERROR");
				});
				return;
			};

			var args = message.content.split(" ");
			var command = args[0];
			var cmd = CH.getCommand(command);

			var data = {
				id: result[0].id,
				lang: result[0].lang,
				stats: {
					messageSents: result[0].messages,
					caractersSents: result[0].caracters,
					money: result[0].money,
					xp: result[0].xp,
					level: result[0].level
				},
				sanctions: {
					bans: result[0].bans,
					kicks: result[0].kicks
				}
			};

			if(!cmd) {
				if(!queued[message.author.id]) {
					queued[message.author.id] = {
						sent: 0,
						caracs: 0,
						reward: 0
					};
				};
				
				queued[message.author.id].sent++;
				queued[message.author.id].caracs += message.content.length;

				if(message.content.length >= 200) {
					queued[message.author.id].reward += Math.floor(Math.random() * 20) + 1;
				} else queued[message.author.id].reward += Math.floor(Math.random() * 15) + 1;

				var serial = require("./assets/serial.json");
				var pos = data.stats.level + 1;

				if(data.stats.xp >= serial[pos]) {
					db.query("UPDATE users SET level = level + 1 WHERE id = " + data.id + ";", function(err, result, fields) {
						if(err) return log("La mise à jour du niveau de l'utilisateur '" + message.author.id + "' à échouée sur le serveur '" + message.guild.id + "': " + err, "ERROR");

						if(data.lang == "fr") {
							message.channel.send(new Discord.RichEmbed({
								color: hexToDec.hexToDec(colors.blue),
								title: ":bell: " + message.author.username + ", vous passez au niveau **" + pos + "**!"
							}));
						} else {
							if(data.lang == "en") {
								message.channel.send(new Discord.RichEmbed({
									color: hexToDec.hexToDec(colors.blue),
									title: ":bell: " + message.author.username + ", you're going to level **" + pos + "**!"
								}));
							};
						};
					});
				};

				//XP and Levels updates every messages sents by users.
				db.query("UPDATE users SET xp = xp + " + queued[message.author.id].reward + " WHERE id = " + data.id + ";", function(err, result, fields) {
					queued[message.author.id].reward = 0;
					if(err) return log("La mise à jour du système d'expérience à rencontrée un problème: " + err, "ERROR");
				});

				if(queued[message.author.id].sent >= 5) {
					//Statistics updates every 5 messages sents by users.
					db.query("UPDATE users SET messages = messages + " + queued[message.author.id].sent + ", caracters = caracters + " + queued[message.author.id].caracs + " WHERE id = " + data.id + ";", function(err, result, fields) {
						if(err) return log("La mise à jour des statistiques à rencontrée un problème: " + err, "ERROR");
					});

					queued[message.author.id].sent = 0;
					queued[message.author.id].caracs = 0;
				};

				return;
			} else {
				try {
					cmd.run(bot, message, args, data, settings, db);
				} catch(e) {//Don't use 'err' it may be overwritten in IE 8 and earlier. (W002)
					log("La commande à rencontrée un problème:\n" + e, "ERROR");
				};
			};
		});
	});
});

bot.on("ready", () => {
	log("Client pret est connecté à discord.", "INFO");
	bot.user.setActivity("Elysium", {
		type: "WATCHING"
	}).catch();

	db.connect(function(err) {
		if(err) return log("Une erreur est survenue lors de la connexion à la base de données: " + err, "FATAL");

		log("Base de données connectée avec succés.", "INFO");
		db.init();
	});
});

bot.on("guildMemberAdd", member => {
	db.query("SELECT id FROM users WHERE user_id = '" + member.id + "' AND server_id = '" + member.guild.id + "';", function(err, result, fields) {
		if(err) return log("guildMemberAdd: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "ERROR");

		if((!result) || (!result[0]) || (!result[0].id)) {
			db.query("SELECT lang, start_money FROM servers_settings WHERE server_id = '" + member.guild.id + "';", function(err, result, fields) {
				if(err) return log("guildMemberAdd: La langue par défault du serveur n'a pas pû être récupérée: " + err, "ERROR");

				var defaultLang = result[0].lang;
				var startMoney = result[0].start_money;

				db.query("INSERT INTO users VALUES (null, " + member.id + ", " + member.guild.id + ", '" + defaultLang + "', 0, 0, " + startMoney + ", 0, 0, 0, 0)", function(err, result, fields) {
					if(err) return log("guildMemberAdd: Une erreur est survenue lors de la création du compte de " + chalk.green(member.id) + " sur le serveur " + chalk.green(member.guild.id) + ": " + err, "ERROR");
				});
			});
		};
	});
});

bot.on("guildCreate", guild => {
	createServer(guild);
});

db.on("error", err => {
	log("La base de données à rencontrée une erreur: " + err, "FATAL");

	db.destroy();

	db.connect(function(err) {
		if(err) return log("Une erreur est survenue lors de la reconnexion à la base de données: " + err, "FATAL");

		log("Base de données reconnectée avec succés.", "INFO");
		db.init();
	});
});

bot.login(process.env.TOKEN).catch(err => {
	return log("La tentative de connection a échouée. Erreur sauvegardée: " + err, "FATAL");
});