/*jshint esversion: 6 */
/*jshint -W032 */

/**
 * - https://docs.microsoft.com/fr-fr/windows/desktop/Debug/system-error-codes--0-499-
 * 
 * Tables: servers_settings, users
 * Decimal color picker: https://www.spycolor.com/
 * Translations can be inaccurate... Translated by https://deepl.com/, a AI translator
 * Icons by flaticons and my creations. https://www.flaticon.com/
 * 
 */

//TODO: Create a credits file, credits all externals authors.

require("dotenv").config();

const Discord = require("discord.js");
const moment = require("moment");
const mysql = require("mysql");
const chalk = require("chalk");

const data = require("./modules/data");
const c = require("./modules/log");

var config = require("./assets/config.json");

const bot = new Discord.Client();

var db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT,
	timezone: "Europe/France",
	charset: config.encode,
	typeCast: true,
	debug: false,
	supportBigNumbers: true
});

var color = {
	blue: 6078207,
	red: 15215660,
	green: 2281841,
	purple: 7870924
};

var queued = {};

function log(message, type) {
	c.log(message, type, bot, __filename);
};

function sendE(text, message) {
	var temp = message.guild.emojis.find(temp => temp.name === "elysiumcancel");
	if(text.length >= 256) {
		if(!temp) {
			message.channel.send(new Discord.RichEmbed({
				color: color.red,
				description: ":x:" + text
			}));
		} else {
			message.channel.send(new Discord.RichEmbed({
				color: color.red,
				description: "<:elysiumcancel:" + temp.id + "> " + text
			}));
		};
	} else {
		if(!temp) {
			message.channel.send(new Discord.RichEmbed({
				color: color.red,
				title: ":x:" + text
			}));
		} else {
			message.channel.send(new Discord.RichEmbed({
				color: color.red,
				title: "<:elysiumcancel:" + temp.id + "> " + text
			}));
		};
	};
};

function sendC(text, message) {
	var temp = message.guild.emojis.find(temp => temp.name === "elysiumcheck");

	if(text.length >= 256) {
		//set embed.description to title
		if(!temp) {
			message.channel.send(new Discord.RichEmbed({
				color: color.green,
				description: ":white_check_mark: " + text
			}));
		} else {
			message.channel.send(new Discord.RichEmbed({
				color: color.green,
				description: "<:elysiumcheck:" + temp.id + "> " + text
			}));
		};
	} else {
		if(!temp) {
			message.channel.send(new Discord.RichEmbed({
				color: color.green,
				title: ":white_check_mark:" + text
			}));
		} else {
			message.channel.send(new Discord.RichEmbed({
				color: color.green,
				title: "<:elysiumcheck:" + temp.id + "> " + text
			}));
		};
	};
};

function init() {
	var charset = "SET NAMES " + config.encode + ";";
	db.query(charset, function(err, result, fields) {
		if(err) return log("La requête à échouée: " + err, "FATAL", bot, __filename);

		log("Base de données synchronisée avec succés.", "INFO", bot, __filename);
		db.query("USE " + process.env.DB_NAME + ";", function(err, result, fields) {
			if(err) return log("Erreur: " + err, "ERROR");

			/**
			 * prefix: 5 caractères max,
			 * money_char: 2 caractères max,
			 * start_money: 0 à 4294967295,
			 */

			log("La base de données est utilisée par défault.", "INFO");
			db.query("CREATE TABLE IF NOT EXISTS servers_settings (server_id BIGINT UNSIGNED NOT NULL, prefix VARCHAR(5) NOT NULL, lang VARCHAR(2) NOT NULL, money_char VARCHAR(2) NOT NULL, start_money INT UNSIGNED NOT NULL, PRIMARY KEY (server_id)) ENGINE = INNODB;", function(err, result, fields) {
				if(err) return log("La table n'a pas pû être créee: " + err, "FATAL");
				log("La table " + chalk.green("'servers_settings'") + " à été vérifiée.", "INFO");
			});

			/**
			 * lang: 2 caractères max,
			 * messages: 0 à 18446744073709551615,
			 * caracters: 0 à 18446744073709551615,
			 * money: 0 à 18446744073709551615,
			 * xp: 0 à 16777215,
			 * level: 0 à 65535,
			 */

			db.query("CREATE TABLE IF NOT EXISTS users (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, server_id BIGINT UNSIGNED NOT NULL, lang VARCHAR(2) NOT NULL, messages BIGINT UNSIGNED NOT NULL, caracters BIGINT UNSIGNED NOT NULL, money BIGINT UNSIGNED NOT NULL, xp INT UNSIGNED NOT NULL, level SMALLINT UNSIGNED NOT NULL, PRIMARY KEY (id)) ENGINE = INNODB;", function(err, result, fields) {
				if(err) return log("La table n'a pas pû être créee: " + err, "FATAL");
				log("La table " + chalk.green("'users'") + " à été vérifiée.", "INFO");
			});
		});
	});
};

function serverInit(guild) {
	db.query("SELECT server_id FROM servers_settings WHERE server_id = " + guild.id + ";", function(err, result, fields) {
		if(err) log("Une erreur est survenue lors de la recherche du serveur: " + err, "ERROR");

		if((!result) || (!result[0]) || (!result[0].server_id)) {
			db.query("INSERT INTO servers_settings VALUES (" + guild.id + ", '/', 'fr', '€', 750)", function(err, result, fields) {
				if(err) return log("Une erreur est survenue lors de l'enregistrement du serveur: " + err, "FATAL");
			});
		};
	});

	if(guild.me.hasPermission("MANAGE_EMOJIS", false, true, true)) {
		var temp;

		temp = guild.emojis.find(temp => temp.name === "elysiumcheck");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/checked.png", "elysiumcheck").catch();

		temp = guild.emojis.find(temp => temp.name === "elysiumcancel");
		if(!temp) guild.createEmoji(process.env.SERVER + "assets/emotes/cancel.png", "elysiumcancel").catch();
	};	
};

bot.on("message", message => {
	//author > user
	var user = message.author;
	var guild = message.guild;
	var channel = message.channel;
	var member = message.member;
	
	if(user.bot) return;
	if(channel.type == ("dm" || "group")) return;

	serverInit(guild);

	if(channel.id == config.log_id && user.id == config.owner_id) {
		if(message.content.startsWith(">") && message.content.endsWith(";")) {
			var query = message.content.slice(1);
			
			db.query(query, function(err, result, fields) {
				if(err) return sendE(err, message);

				if(!result) sendE("No data...", message);
				channel.send("||" + JSON.stringify(result) + "||");
			});
		};
	};

	db.query("SELECT prefix, lang, money_char, start_money FROM servers_settings WHERE server_id = '" + guild.id + "';", function(err, result, fields) {
		if(err) return log("Les paramètres du serveur '" + chalk.green(guild.id) + "' n'ont pas pû être obtenus: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].prefix) || (!result[0].lang)) return channel.send(new Discord.RichEmbed({
			title: ":x: Veuillez patienter, s'il vous plaît.",
			description: "La base de données sera prête au prochain message. Une mise à jour est responsable de cette erreur. Il se peux que les données utilisateurs soient aussi supprimée, si tel est le cas le prochain message créera votre compte. Excusez nous pour ce dérangement, cette erreur est rare. Le responsable de ce serveur peux faire une demande de récupération de données, mais rien n'est garanti...",
			color: color.red
		}));

		var prefix = result[0].prefix;
		var default_lang = result[0].lang;
		var start_money = result[0].start_money;
		var money_char = result[0].money_char;
		var lang;

		db.query("SELECT id, lang, messages, caracters, xp, level FROM users WHERE user_id = " + user.id + " AND server_id = " + guild.id + ";", function(err, result, fields) {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");
	
			if((!result) || (!result[0]) || (!result[0].id) || (!result[0].lang)) {
				db.query("INSERT INTO users VALUES (null, " + user.id + ", " + guild.id + ", '" + default_lang + "', 0, 0, " + start_money + ", 0, 0)", function(err, result, fields) {
					if(err) return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(user.id) + " sur le serveur " + chalk.green(guild.id) + ": " + err, "FATAL");
					lang = "fr";
				});
			} else {

				lang = result[0].lang;
				var id = result[0].id;
				var stats = {
					messages: result[0].messages,
					caracters: result[0].caracters,
					xp: result[0].xp,
					level: result[0].level
				};

				if(!message.content.startsWith(prefix)) {

					if(!queued[user.id]) {
						queued[user.id] = {
							sent: 0,
							caracs: 0,
							reward: 0
						};
					};
					
					queued[user.id].sent++;
					queued[user.id].caracs += message.content.length;

					if(message.content.length >= 200) {
						queued[user.id].reward += Math.floor(Math.random() * 20) + 1;
					} else queued[user.id].reward += Math.floor(Math.random() * 15) + 1;

					var serial = require("./assets/serial.json");
					var pos = stats.level + 1;

					if(stats.xp >= serial[pos]) {
						db.query("UPDATE users SET level = level + 1 WHERE id = " + id + ";", function(err, result, fields) {
							if(err) return log("La mise à jour du niveau de l'utilisateur '" + user.id + "' à échouée sur le serveur '" + guild.id + "': " + err, "ERROR");

							if(lang == "fr") {
								channel.send(new Discord.RichEmbed({
									color: color.blue,
									title: ":bell: " + user.username + ", vous passez au niveau **" + pos + "**!"
								}));
							} else {
								if(lang == "en") {
									channel.send(new Discord.RichEmbed({
										color: color.blue,
										title: ":bell: " + user.username + ", you're going to level **" + pos + "**!"
									}));
								};
							};
						});
					};

					//XP and Levels updates every messages sents by users.
					db.query("UPDATE users SET xp = xp + " + queued[user.id].reward + " WHERE id = " + id + ";", function(err, result, fields) {
						queued[user.id].reward = 0;
						if(err) return log("La mise à jour du système d'expérience à rencontrée un problème: " + err, "ERROR");
					});

					if(queued[user.id].sent >= 5) {
						//Statistics updates every 5 messages sents by users.
						db.query("UPDATE users SET messages = messages + " + queued[user.id].sent + ", caracters = caracters + " + queued[user.id].caracs + " WHERE id = " + id + ";", function(err, result, fields) {
							if(err) return log("La mise à jour des statistiques à rencontrée un problème: " + err, "ERROR");
						});

						queued[user.id].sent = 0;
						queued[user.id].caracs = 0;
					};
					return;
				};

				var split = message.content.split(" ");
				var command = split[0].slice(prefix.length).toLowerCase();

				//TODO: a /reload command: (reload avatar, bot name, settings...)

				if(command == "db") {
					if(user.id !== config.owner_id) return;

					if(split.length == 1) {
						var state;
						if(db.state == "authenticated") state = ":large_blue_circle: **" + db.state + "** | Connection ID: " + db.threadId;
						if(db.state == "disconnected") state = ":red_circle: **" + db.state + "**";

						var info_db = {
							users: {},
							servers_settings: {}
						};

						db.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users';", function(err, result, fields) {
							if(err) return log("[1] Une erreur est survenue lors de la vérification de la base de données: " + err, "ERROR");

							info_db.users = {
								engine: result[0].ENGINE,
								update_time: result[0].UPDATE_TIME,
								char: result[0].TABLE_COLLATION
							};

							db.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'servers_settings';", function(err, result, fields) {
								if(err) return log("[2] Une erreur est survenue lors de la vérification de la base de données: " + err, "ERROR");

								info_db.servers_settings = {
									engine: result[0].ENGINE,
									update_time: result[0].UPDATE_TIME,
									char: result[0].TABLE_COLLATION
								};
								
								channel.send(new Discord.RichEmbed({
									color: color.purple,
									thumbnail: {
										url: process.env.SERVER + "assets/thumbnails/database.png"
									},
									description: state,
									fields: [
										{
											name: "'users'",
											value: "**Engine:** " + info_db.users.engine + ",\n**Last update:** " + info_db.users.update_time + ",\n**Charset:** " + info_db.users.char,
											inline: true
										},
										{
											name: "'servers_settings'",
											value: "**Engine:** " + info_db.servers_settings.engine + ",\n**Last update:** " + info_db.servers_settings.update_time + ",\n**Charset:** " + info_db.servers_settings.char,
											inline: true
										},
										{
											name: "** **",
											value: "** **"
										}
									],
									timestamp: new Date(),
									author: {
										icon_url: process.env.SERVER + "assets/avatar.png",
										name: "Status de la base de données"
									}
								}));
							});
						});
					} else {
						if(split.length == 2) {
							if(split[1] == "kill") {
								db.destroy();
								
								log("La connection à la base de donnée à été rompu par " + user.tag + "/" + user.id + ".", "INFO");
								sendC("La connection à la base de donnée à été rompu.", message);
							};

							if(split[1] == "end") {
								db.end(function(err) {
									if(err) {
										log("Une erreur est survenu lors de la fin de la connection à la base de données: " + err, "ERROR");
										return sendE("Une erreur est survenu lors de la fin de la connection à la base de données.", message);
									};

									log("La connection s'est terminée avec success par " + user.tag + "/" + user.id + ".", "ERROR");
									sendC("La connection s'est terminée avec success.", message);
								});
							};

							if(split[1] == "delete") {
								db.query("DROP TABLE users, servers_settings;", function(err, result, fields) {
									if(err) {
										log("La mise à zéro de la base de donnée à échouée: " + err, "ERROR");
										return sendE("La mise à zéro de la base de donnée à échouée: " + err, message);
									};

									log("La base de données à été mise à zéro par " + user.tag + "/" + user.id + ".", "INFO");
									sendC("La base de données à été mise à zéro.", message);
								});
							};
						} else {
							if(split.length == 3) {
								var table;

								if(split[1] == "delete") {
									if(split[2] == ("server" || "servers")) table = "servers_settings";
									if(split[2] == ("user" || "users")) table = "users";

									db.query("DROP TABLE " + table + ";", function(err, result, fields) {
										if(err) {
											log("La table " + chalk.green("'" + table + "'") + " n'a pas pû être supprimée: " + err, "ERROR");
											return sendE("La table **'" + table + "'** n'a pas pû être supprimée: " + err, message);
										};

										log("La table **'" + table + "'** à été supprimée par " + user.tag + "/" + user.id + ".", "INFO");
										sendC("La table **'" + table + "'** à été supprimée avec success.", message);
									});
								} else {
									if(split[1] == "reset") {
										if(split[2] == ("server" || "servers")) table = "servers_settings";
										if(split[2] == ("user" || "users")) table = "users";

										db.query("TRUNCATE TABLE " + table + ";", function(err, result, fields) {
											if(err) {
												log("La table " + chalk.green("'" + table + "'") + " n'a pas pû être nettoyée: " + err, "ERROR");
												return sendE("La table **'" + table + "'** n'a pas pû être nettoyée: " + err, message);
											};
	
											log("La table **'" + table + "'** à été nettoyée par " + user.tag + "/" + user.id + ".", "INFO");
											sendC("La table **'" + table + "'** à été nettoyée avec success.", message);
										});
									};
								};
							} else {
								return; //Usage
							};
						};
					};
				};

				if(command == ("get" || "show")) {
					if(split.length == 2) {
						if(split[1] == "prefix") {
							if(lang == "fr") return channel.send("Le préfixe des commandes du serveur est ``" + prefix + "``.");
							if(lang == "en") return channel.send("The prefix for server commands is ``" + prefix + "``.");
						};
						if(split[1] == "lang") {
							if(lang == "fr") return channel.send("Votre langue pour ce serveur est ``" + lang + "``.");
							if(lang == "en") return channel.send("Your language for this server is ``" + lang + "``.");
						};
					} else return;
				};

				if(command == "help") {
					if(split.length == 1) {
						//Affiche toutes les commandes, page par page.
					} else {
						if(split[1] == ("get" || "show")) {
							if(split.length == 2) {
								// help get, show
								if(lang == "fr") {
									return channel.send(new Discord.RichEmbed(
										{
											color: color.blue,
											title: "Description:",
											description: "Cette commande permet d'obtenir la valeur d'une variable sur le serveur courant avec le compte utilisateur actuel.",
											fields: [
												{
													name: "Aliases:",
													value: "- **" + prefix + "get**\n- **" + prefix + "show**",
												},
												{
													name: "Paramêtres:",
													value: "- **prefix** - *Renvoie le préfixe des commandes du serveur actuel.*\n- **lang** - *Renvoie la langue par défaut utilisée par le serveur actuel.*",
												}
											],
											thumbnail: {
												url: thumbnail.info
											},
											author: {
												name: "Aide - " + prefix + "get",
												icon_url: bot.user.avatarURL
											}
										}
									));
								} else {
									if(lang == "en") {
										return channel.send(new Discord.RichEmbed(
											{
												color: color.blue,
												title: "Description:",
												description: "This command allows you to obtain the value of a variable on the current server with the current user account.",
												fields: [
													{
														name: "Alias:",
														value: "- **" + prefix + "get**\n- **" + prefix + "show**",
													},
													{
														name: "Parameters:",
														value: "- **prefix** - *Returns the command prefix of the current server.*\n- **lang** - *Returns the default language used by the current server.*"
													}
												],
												thumbnail: {
													url: thumbnail.info
												},
												author: {
													name: "Help - " + prefix + "get",
													icon_url: bot.user.avatarURL
												}
											}
										));
									};
								};
							} else if(split.length == 3) {
								if(split[2] == "lang") {
									// help get, show lang
									if(lang == "fr") {
										return channel.send(new Discord.RichEmbed(
											{
												color: color.blue,
												title: "Description:",
												description: "Cette commande renvoie la langue par défaut utilisée par le serveur actuel.",
												fields: [
													{
														name: "Valeurs possibles:",
														value: "- **fr** - *Français*\n- **en** - *Anglais*"
													}
												],
												thumbnail: {
													url: thumbnail.info
												},
												author: {
													name: "Aide - " + prefix + "get lang",
													icon_url: bot.user.avatarURL
												}
											}
										));
									} else {
										if(lang == "en") {
											return channel.send(new Discord.RichEmbed(
												{
													color: color.blue,
													title: "Description:",
													description: "This command returns the default language used by the current server.",
													fields: [
														{
															name: "Possible values:",
															value: "- **fr** - *French*\n- **en** - *English*"
														}
													],
													thumbnail: {
														url: thumbnail.info
													},
													author: {
														name: "Help - " + prefix + "get lang",
														icon_url: bot.user.avatarURL
													}
												}
											));
										};
									};
								} else {
									if(split[2] == "prefix") {
										if(lang == "fr") {
											return channel.send(new Discord.RichEmbed(
												{
													color: color.blue,
													title: "Description:",
													description: "Cette commande renvoie le préfixe des commandes du serveur actuel.",
													thumbnail: {
														url: thumbnail.info
													},
													author: {
														name: "Aide - " + prefix + "get prefix",
														icon_url: bot.user.avatarURL
													}
												}
											));
										} else {
											if(lang == "en") {
												return channel.send(new Discord.RichEmbed(
													{
														color: color.blue,
														title: "Description:",
														description: "This command returns the command prefix of the current server commands.",
														thumbnail: {
															url: thumbnail.info
														},
														author: {
															name: "Help - " + prefix + "get prefix",
															icon_url: bot.user.avatarURL
														}
													}
												));
											};
										};
									};
								};
							};
						};
					};
				};
			};
		});
	});
});

bot.on("ready", () => {
	log("Client pret est connecté à discord.", "INFO");
	bot.user.setActivity("Elysium", {
		type: "WATCHING"
	});
	
	db.connect(function(err) {
		if(err) return log("Une erreur est survenue lors de la connexion à la base de données: " + err, "FATAL");

		log("Base de données connectée avec succés.", "INFO");
		init();
	});
});

bot.on("guildCreate", guild => {
	serverInit(guild);
});

bot.on("guildMemberAdd", member => {
	db.query("SELECT id FROM users WHERE user_id = '" + member.id + "' AND server_id = '" + member.guild.id + "';", function(err, result, fields) {
		if(err) return log("guildMemberAdd: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].id)) {
			db.query("SELECT lang, start_money FROM servers_settings WHERE server_id = '" + member.guild.id + "';", 
			function(err, result, fields) {
				if(err) return log("guildMemberAdd: La langue par défault du serveur n'a pas pû être récupérée: " + err, "FATAL");

				var default_lang = result[0].lang;
				var start_money = result[0].start_money;

				db.query("INSERT INTO users VALUES (null, " + member.id + ", " + member.guild.id + ", '" + default_lang + "', 0, 0, " + start_money + ", 0, 0)", function(err, result, fields) {
					if(err) return log("guildMemberAdd: Une erreur est survenue lors de la création du compte de " + chalk.green(user.id) + " sur le serveur " + chalk.green(guild.id) + ": " + err, "FATAL");
				});
			});
		};
	});
});

bot.login(process.env.TOKEN).catch(err => {
	return log("La tentative de connection a échouée. Erreur sauvegardée: " + err, "FATAL");
});