/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/

//https://github.com/visionmedia/node-progress PROGRESS BAR

require("dotenv").config();

const { CommandHandler } = require("djs-commands");
const { Pool } = require("pg");
const hexToDec = require("./modules/hexConverter");
const Discord = require("discord.js");
const request = require("request");
const sparkly = require("sparkly");
const chalk = require("chalk");

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

const db = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	keepAlive: true
});

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
		var temp;

		temp = guild.emojis.find(temp => temp.name === "elysiumcheck");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/checked.png", "elysiumcheck").catch();

		temp = guild.emojis.find(temp => temp.name === "elysiumcancel");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/cancel.png", "elysiumcancel").catch();
	};

	db.query("SELECT server_id FROM servers_settings WHERE server_id = " + guild.id + ";", function(err, result, fields) {
		if(err) log("Une erreur est survenue lors de la recherche du serveur: " + err, "FATAL");

		if((!result) || (!result.rows[0]) || (!result.rows[0].server_id)) {
			//options must be converted to decimal: https://www.rapidtables.com/convert/number/binary-to-decimal.html
			db.query(`INSERT INTO servers_settings (server_id, prefix, lang, money_char, start_money, announcements_channel_id, music_voice_id, options) VALUES (${guild.id}, '${config.default.prefix}', '${config.default.lang}', '${config.default.currency}', ${config.default.money}, 0, 0, ${config.default.options});`, function(err, result, fields) {
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

	db.query("CREATE TABLE IF NOT EXISTS servers_settings (server_id BIGINT NOT NULL, prefix VARCHAR(5) NOT NULL, lang CHAR(2) NOT NULL, money_char VARCHAR(3) NOT NULL, start_money INT NOT NULL, announcements_channel_id BIGINT NOT NULL, music_voice_id BIGINT NOT NULL, options BIGINT NOT NULL, PRIMARY KEY (server_id));", function(err, result, fields) {
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

	db.query("CREATE TABLE IF NOT EXISTS users (id SERIAL NOT NULL, user_id BIGINT NOT NULL, server_id BIGINT NOT NULL, lang VARCHAR(2) NOT NULL, messages BIGINT NOT NULL, caracters BIGINT NOT NULL, money BIGINT NOT NULL, xp INT NOT NULL, level SMALLINT NOT NULL, bans SMALLINT NOT NULL, kicks SMALLINT NOT NULL, PRIMARY KEY (id));", function(err, result, fields) {
		if(err) return log("La table " + chalk.green("'users'") + " n'a pas pû être créé: " + err, "FATAL");
		log("La table " + chalk.green("'users'") + " à été vérifiée.", "INFO");
	});

	/**
	 * banned_at: DATE,
	 * revoke_at: DATE,
	 * admin_id: 0 à 18446744073709551615,
	 * reason: 255 caractères max,
	 */

	db.query("CREATE TABLE IF NOT EXISTS bans (id SERIAL NOT NULL, user_id BIGINT NOT NULL, server_id BIGINT NOT NULL, banned_at DATE NOT NULL, revoke_at DATE NOT NULL, admin_id BIGINT NOT NULL, reason VARCHAR(255), PRIMARY KEY (id));", function(err, result, fiels) {
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

	db.query("SELECT prefix, lang, money_char, start_money, announcements_channel_id, music_voice_id, options FROM servers_settings WHERE server_id = '" + message.guild.id + "';", function(err, result, fields) {
		if(err) return log("Les paramètres du serveur " + chalk.green("'" + message.guild.id + "'") + " n'ont pas pû être obtenus: " + err, "FATAL");

		if((!result) || (!result.rows[0]) || (!result.rows[0].prefix) || (!result.rows[0].lang)) return message.channel.send(new Discord.RichEmbed({
			title: ":x: Veuillez patienter, s'il vous plaît.",
			description: "La base de données sera prête au prochain message. Une mise à jour est responsable de cette erreur. Il se peux que les données utilisateurs soient aussi supprimée, si tel est le cas le prochain message créera votre compte. Excusez nous pour ce dérangement, cette erreur est rare. Le responsable de ce serveur peux faire une demande de récupération de données, mais rien n'est garanti... Support prioritaire: vincent.bernhardt67@gmail.com",
			color: hexToDec.hexToDec(colors.red)
		}));

		var settings = {
			defaultLang: result.rows[0].lang,
			prefix: result.rows[0].prefix,
			currency: result.rows[0].money_char,
			startMoney: result.rows[0].start_money,
			announcementsChannel: result.rows[0].announcements_channel_id,
			musicChannel: result.rows[0].music_voice_id,
			plugins: result.rows[0].options
		};

		CH.prefix = settings.prefix;

		db.query("SELECT id, lang, messages, caracters, money, xp, level, bans, kicks FROM users WHERE user_id = " + message.author.id + " AND server_id = " + message.guild.id + ";", function(err, result, fields) {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");
	
			if((!result) || (!result.rows[0]) || (!result.rows[0].id) || (!result.rows[0].lang)) {
				db.query("INSERT INTO users (user_id, server_id, lang, messages, caracters, money, xp, level, bans, kicks) VALUES (" + message.author.id + ", " + message.guild.id + ", '" + settings.defaultLang + "', 0, 0, " + settings.startMoney + ", 0, 0, 0, 0)", function(err, result, fields) {
					if(err) return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(message.author.id) + " sur le serveur " + chalk.green(message.guild.id) + ": " + err, "ERROR");
				});
				return;
			};

			var args = message.content.split(" ");
			var command = args[0];
			var cmd = CH.getCommand(command);

			var data = {
				id: result.rows[0].id,
				lang: result.rows[0].lang,
				stats: {
					messageSents: result.rows[0].messages,
					caractersSents: result.rows[0].caracters,
					money: result.rows[0].money,
					xp: result.rows[0].xp,
					level: result.rows[0].level
				},
				sanctions: {
					bans: result.rows[0].bans,
					kicks: result.rows[0].kicks
				}
			};

			if(!cmd) {
				let reward;

				if(message.content.length >= 200) {
					reward = Math.floor(Math.random() * 22) + 1;
				} else reward = Math.floor(Math.random() * 17) + 1;

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

				//XP and Levels and now messages updates every messages sents by users.
				db.query("UPDATE users SET xp = xp + " + reward + " WHERE id = " + data.id + ";", function(err, result, fields) {
					reward = 0;
					if(err) return log("La mise à jour du système d'expérience à rencontrée un problème: " + err, "ERROR");
				});

				db.query("UPDATE users SET messages = messages + 1, caracters = caracters + " + message.content.length + " WHERE id = " + data.id + ";", function(err, result, fields) {
					if(err) return log("La mise à jour des statistiques à rencontrée un problème: " + err, "ERROR");
				});

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

		if((!result) || (!result.rows[0]) || (!result.rows[0].id)) {
			db.query("SELECT lang, start_money FROM servers_settings WHERE server_id = '" + member.guild.id + "';", function(err, result, fields) {
				if(err) return log("guildMemberAdd: La langue par défault du serveur n'a pas pû être récupérée: " + err, "ERROR");

				var defaultLang = result.rows[0].lang;
				var startMoney = result.rows[0].start_money;

				db.query("INSERT INTO users (user_id, server_id, lang, messages, caracters, money, xp, level, bans, kicks) VALUES (" + member.id + ", " + member.guild.id + ", '" + defaultLang + "', 0, 0, " + startMoney + ", 0, 0, 0, 0)", function(err, result, fields) {
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

	db.end();

	db.connect(function(err) {
		if(err) return log("Une erreur est survenue lors de la reconnexion à la base de données: " + err, "FATAL");

		log("Base de données reconnectée avec succés.", "INFO");
		db.init();
	});
});

bot.login(process.env.TOKEN).catch(err => {
	return log("La tentative de connection a échouée. Erreur sauvegardée: " + err, "FATAL");
});