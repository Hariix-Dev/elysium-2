/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const config = require("../assets/config.json");
const colors = require("../assets/colors.json");
const hexToDec = require("../modules/hexConverter");

module.exports = class db {
	constructor() {
		this.name = "db",
		this.alias = [],
		this.usage = "/db [args]";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);
		if(message.author.id != config.ownerId) return;
		
		if(args.length == 1) {
			var state;

			switch(db.state) {
				case "authenticated":
					state = `:large_blue_circle: **${db.state}** | Connection ID: ${db.threadId}`;
				break;

				case "disconnected":
					state = `:red_circle: **${db.state}**`;
				break;

				default: state = `:white_circle: **${db.state}**`;
			};

			var infos = {
				users: {},
				servers: {}
			};

			db.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users';", function(err, result, fields) {
				if(err) return log("[1] Une erreur est survenue lors de la vérification de la base de données: " + err);

				infos.users = {
					engine: result[0].ENGINE,
					lastUpdate: result[0].UPDATE_TIME,
					char: result[0].TABLE_COLLATION
				};

				db.query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'servers_settings';", function(err, result, fields) {
					if(err) return log("[2] Une erreur est survenue lors de la vérification de la base de données: " + err);

					infos.servers = {
						engine: result[0].ENGINE,
						lastUpdate: result[0].UPDATE_TIME,
						char: result[0].TABLE_COLLATION
					};

					message.channel.send(new Discord.RichEmbed({
						color: hexToDec.hexToDec(colors.purple),
						thumbnail: {
							url: process.env.SERVER + "assets/thumbnails/database.png"
						},
						description: state,
						fields: [
							{
								name: "'users'",
								value: "**Engine:** " + infos.users.engine + ",\n**Last update:** " + infos.users.update_time + ",\n**Charset:** " + infos.users.char,
								inline: true
							},
							{
								name: "'servers_settings'",
								value: "**Engine:** " + infos.servers.engine + ",\n**Last update:** " + infos.servers.lastUpdate + ",\n**Charset:** " + infos.servers.char,
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
			if(args.length == 2) {
				switch(args) {
					case "kill":
						db.destroy();

						log("La connection à la base de donnée à été rompu par " + user.toString() + "/" + message.user.id + ".", "WARN");
						sendC("La connection à la base de donnée à été rompu.");
					break;

					case "end":
						db.end(function(err) {
							if(err) {
								log("Une erreur est survenu lors de la fin de la connection à la base de données: " + err, "ERROR");
								return sendE("Une erreur est survenu lors de la fin de la connection à la base de données.");
							};

							log("La connection s'est terminée avec success par " + user.toString() + "/" + message.user.id + ".", "WARN");
							sendC("La connection s'est terminée avec success.");
						});
					break;

					case "delete":
						db.query("DROP TABLE users, servers_settings;", function(err, result, fields) {
							if(err) {
								log("La mise à zéro de la base de donnée à échouée: " + err, "ERROR");
								return sendE("La mise à zéro de la base de donnée à échouée: " + err);
							};

							log("La base de données à été mise à zéro par " + user.toString() + "/" + message.user.id + ".", "WARN");
							sendC("La base de données à été mise à zéro.");
						});
					break;

					default: return;
				};
			} else {
				if(args.length == 3) {
					var table;

					if(args[2] == ("server" || "servers")) table = "servers_settings";
					if(args[2] == ("user" || "users")) table = "users";

					switch (args[1]) {
						case "delete":
							db.query("DROP TABLE " + table + ";", function(err, result, fields) {
								if(err) {
									log("La table " + chalk.green("'" + table + "'") + " n'a pas pû être supprimée: " + err, "ERROR");
									return sendE("La table **'" + table + "'** n'a pas pû être supprimée: " + err);
								};

								log("La table **'" + table + "'** à été supprimée par " + user.toString() + "/" + message.user.id + ".", "WARN");
								sendC("La table **'" + table + "'** à été supprimée avec success.");
							});
						break;

						case "reset":
							db.query("TRUNCATE TABLE " + table + ";", function(err, result, fields) {
								if(err) {
									log("La table " + chalk.green("'" + table + "'") + " n'a pas pû être nettoyée: " + err, "ERROR");
									return sendE("La table **'" + table + "'** n'a pas pû être nettoyée: " + err);
								};

								log("La table **'" + table + "'** à été nettoyée par " + user.toString() + "/" + message.user.id + ".", "WARN");
								sendC("La table **'" + table + "'** à été nettoyée avec success.");
							});
						break;
					
						default: return;
					}
				};
			};
		};
	};
};