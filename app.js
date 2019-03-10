/*jshint esversion: 6 */
/*jshint -W032 */

/**
 * - https://docs.microsoft.com/fr-fr/windows/desktop/Debug/system-error-codes--0-499-
 * 
 * Tables: servers_settings, users
 * Decimal color picker: https://www.spycolor.com/
 */

require("dotenv").config();

const Discord = require("discord.js");
const request = require("request");
const moment = require("moment");
const mysql = require("mysql");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

const data = require("./modules/data");
const c = require("./modules/log");

var config = require("./assets/config.json");

const bot = new Discord.Client();

var db = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD
});

var color = {
	blue: 6078207,
	red: 15215660
};

var queued = {};

var thumbnail = {
	info: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Info_Simple.svg/1000px-Info_Simple.svg.png"
};

function log(message, type) {
	c.log(message, type, bot, __filename);
};

function init() {
	var charset = "SET NAMES " + config.encode + ";";
	db.query(charset, function(err, result, fields) {
		if(err) return log("La requête à échouée: " + err, "FATAL", bot, __filename);

		log("Base de données synchronisée avec succés.", "INFO", bot, __filename);
		db.query("USE " + process.env.DB_NAME + ";", function(err, result, fields) {
			if(err) return log("Erreur: " + err, "ERROR");

			log("La base de données est utilisée par défault.", "INFO");
			db.query("CREATE TABLE IF NOT EXISTS servers_settings (server_id BIGINT UNSIGNED NOT NULL, prefix VARCHAR(5) NOT NULL, lang VARCHAR(2) NOT NULL, PRIMARY KEY (server_id)) ENGINE=INNODB;", function(err, result, fields) {
				if(err) return log("La table n'a pas pû être créee: " + err, "FATAL");
				log("La table " + chalk.green("'servers_settings'") + " à été vérifiée.", "INFO");
			});

			db.query("CREATE TABLE IF NOT EXISTS users (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, user_id BIGINT UNSIGNED NOT NULL, server_id BIGINT UNSIGNED NOT NULL, lang VARCHAR(2) NOT NULL, messages BIGINT UNSIGNED NOT NULL, caracters BIGINT UNSIGNED NOT NULL, PRIMARY KEY (id)) ENGINE=INNODB;", function(err, result, fields) {
				if(err) return log("La table n'a pas pû être créee: " + err, "FATAL");
				log("La table " + chalk.green("'users'") + " à été vérifiée.", "INFO");
			});
		});
	});
};

function serverInit(id) {
	db.query("SELECT server_id FROM servers_settings WHERE server_id='" + id + "';", function(err, result, fields) {
		if(err) return log("Une erreur est survenue lors de la recherche du serveur: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].server_id)) {
			db.query("INSERT INTO servers_settings VALUES (" + id + ", '/', 'fr')", function(err, result, fields) {
				if(err) return log("Une erreur est survenue lors de l'enregistrement du serveur: " + err, "FATAL");
			});
		};
	});
};

bot.on("message", message => {
	//author > user
	var user = message.author;
	var guild = message.guild;
	var channel = message.channel;
	var member = message.member;

	if(user.bot) return;
	if(channel.type == ("dm" || "group")) return;

	serverInit(guild.id);

	db.query("SELECT prefix, lang FROM servers_settings WHERE server_id='" + guild.id + "';", function(err, result, fields) {
		if(err) return log("Les paramètres du serveur '" + chalk.green(guild.id) + "' n'ont pas pû être obtenus: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].prefix) || (!result[0].lang)) return channel.send(new Discord.RichEmbed({
			title: ":x: Veuillez patienter, s'il vous plaît. La base de données sera prête au prochain message. Une mise à jour est responsable de cette erreur. Il se peux que les données utilisateurs soient aussi supprimée, si tel est le cas le prochain message créera votre compte. Excusez nous pour ce dérangement, cette erreur est rare.",
			color: color.red
		}));

		var prefix = result[0].prefix;
		var defaultlang = result[0].lang;
		var lang;

		db.query("SELECT id, lang, messages, caracters FROM users WHERE user_id='" + user.id + "' AND server_id='" + guild.id + "';", function(err, result, fields) {
			if(err) return log("message: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");
	
			if((!result) || (!result[0]) || (!result[0].id) || (!result[0].lang)) {
				db.query("INSERT INTO users VALUES (null, " + user.id + ", " + guild.id + ", '" + defaultlang + "', 0, 0)", function(err, result, fields) {
					if(err) return log("message: Une erreur est survenue lors de la création du compte de " + chalk.green(user.id) + " sur le serveur " + chalk.green(guild.id) + ": " + err, "FATAL");
				});
				lang = "fr";
			} else {
				if(!message.content.startsWith(prefix)) {
					if(!queued[user.id]) {
						queued[user.id] = {
							sent: 0,
							caracs: 0
						};
					};
					
					queued[user.id].sent++;
					queued[user.id].caracs += message.content.length;

					if(queued[user.id].sent == 5) {
						db.query("UPDATE users SET messages = messages + " + queued[user.id].sent + ", caracters = caracters + " + queued[user.id].caracs + " WHERE id = " + result[0].id + ";", function(err, result, fields) {
							if(err) return log("La mise à jour des statistiques à rencontrée un problème: " + err, "FATAL");
						});

						queued[user.id] = {
							sent: 0,
							caracs: 0
						};
					};
					return;
				};

				lang = result[0].lang;
				var split = message.content.split(" ");
				var command = split[0].slice(prefix.length).toLowerCase();

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
	serverInit(guild.id);
});

bot.on("guildMemberAdd", member => {
	db.query("SELECT id FROM users WHERE user_id='" + member.id + "' AND server_id='" + member.guild.id + "';", function(err, result, fields) {
		if(err) return log("guildMemberAdd: Une erreur est survenue lors de la recherche de l'utilisateur: " + err, "FATAL");

		if((!result) || (!result[0]) || (!result[0].id)) {
			db.query("SELECT lang FROM servers_settings WHERE server_id='" + member.guild.id + "';", 
			function(err, result, fields) {
				if(err) return log("guildMemberAdd: La langue par défault du serveur n'a pas pû être récupérée: " + err, "FATAL");

				var defaultlang = result[0].lang;
				db.query("INSERT INTO users VALUES (null, " + member.id + ", " + member.guild.id + ", '" + defaultlang + "')", function(err, result, fields) {
					if(err) return log("guildMemberAdd: Une erreur est survenue lors de la création du compte de " + chalk.green(user.id) + " sur le serveur " + chalk.green(guild.id) + ": " + err, "FATAL");
				});
			});
		};
	});
});

bot.login(process.env.TOKEN).catch(err => {
	return log("La tentative de connection a échouée. Erreur sauvegardée: " + err, "FATAL");
});