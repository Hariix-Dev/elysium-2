/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Users = require("../models/users");
const Globals = require("../models/globals");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const Discord = require("discord.js");

module.exports = class slot {
	constructor() {
		this.name = "slot",
		this.alias = [],
		this.en = "Play the slot machine.",
		this.fr = "Joue à la machine à sous.",
		this.usage = "/slot <bid>";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);
		const log = (text, level) => logger(text, level, bot, __filename);

		const bid = Number(args[1]);

		if(args.length === 2) {
			if(isNaN(args[1])) {
				if(data.lang === "fr") return sendE("Argument 'bid' invalide. Synatxe: " + settings.prefix + "slot <bid>");
				if(data.lang === "en") return sendE("Invalid 'bid' argument. Syntax: " + settings.prefix + "slot <bid>");
			};

			if(3 > bid > 10000000) {
				if(data.lang === "fr") return sendE("Votre mise doit être supérieur ou égal à 3" + settings.currency + " et inférieur ou égal à 10 millions d'" + settings.currency + ".");
				if(data.lang === "en") return sendE("Your bet must be greater than or equal to " + settings.currency + "3 and less than or equal to " + settings.currency + "10 million.");
			};

			const emotes = [
				":heart:",
				":cherries:",
				":mushroom:",
				":snowman:",
				":six:",
				":four_leaf_clover:",
				":sunflower:",
				":cyclone:",
				":two:"
			];

			let grid = [];

			for(let i = 0; i < 3; i++) {
				grid[i] = emotes[Math.floor(Math.random() * emotes.length)];
			};

			const base = message.author + "\n\n+----------------+\n> " + grid.join(" ") + " <\n+----------------+\n\n";
			let foot;

			Users.findOne({user_id: message.author.id, server_id: message.guild.id}, (err, res) => {
				if(err) {
					log(err, "ERROR");

					if(data.lang === "fr") return sendE("Une erreur est survenue.");
					if(data.lang === "en") return sendE("An error has occurred.");
				};

				const temp = res.money;

				if(res.money < bid) {
					if(data.lang === "fr") return sendE("Vous n'avez pas assez d'argent.");
					if(data.lang === "en") return sendE("You don't have enough money.");
				};

				if(((grid[0] === grid[1]) && (grid[0] === grid[2])) && grid[0] === ":four_leaf_clover:") {
					res.money += (bid * 4);

					if(data.lang === "fr") foot = "Trois trèfles à quatres feuilles: mise multiplée par quatre.\n+" + (bid * 4) + settings.currency + " (Mise: " + bid + ")";
					if(data.lang === "en") foot = "Three four-leaf clovers: bet multiplied by four.\n+" + (bid * 4) + settings.currency + " (Bid: " + bid + ")";
				} else if((grid[0] === grid[1]) && (grid[0] === grid[2])) {
					res.money += (bid * 3);

					if(data.lang === "fr") foot = "Trois symboles identiques: mise multiplée par trois.\n+" + (bid * 3) + settings.currency + " (Mise: " + bid + ")";
					if(data.lang === "en") foot = "Three identical symbols: Bet multiplied by three.\n+" + (bid * 3) + settings.currency + " (Bid: " + bid + ")";
				} else if((grid[0] === grid[1]) || (grid[1] === grid[2])) {
					res.money += (bid * 2);

					if(data.lang === "fr") foot = "Deux symboles consécutifs: mise multipliée par deux.\n+" + (bid * 2) + settings.currency + " (Mise: " + bid + ")";
					if(data.lang === "en") foot = "Two consecutive symbols: Bet multiplied by two.\n+" + (bid * 2) + settings.currency + " (Bid: " + bid + ")";
				} else if(grid[0] === grid[2]) {
					res.money += bid;

					if(data.lang === "fr") foot = "Deux symboles identiques: Gain de la mise.\n+" + bid + settings.currency;
					if(data.lang === "en") foot = "Two identical symbols: Winning the bid.\n+" + bid + settings.currency;
				} else if(grid[0] === ":heart:" || grid[1] === ":heart:" || grid[2] === ":heart:") {
					res.money += (bid / 3);

					if(data.lang === "fr") foot = "Un coeur: gain de la mise divisé par 3.\n+" + (bid / 3) + settings.currency + " (Mise: " + bid + ")";
					if(data.lang === "en") foot = "One Hearth: winning the bid divided by 3.\n+" + (bid / 3) + settings.currency + " (Bid: " + bid + ")";
				} else {
					res.money -= bid;

					if(data.lang === "fr") foot = "Rien: perte de la mise.\n-" + bid + settings.currency;
					if(data.lang === "en") foot = "Nothing: lose the bid.\n-" + bid + settings.currency;
				};

				res.save().then(() => {
					Globals.findOne({user_id: message.author.id}, (err, g) => {
						let w = ":thumbsup:";

						if(err) return log(err, "ERROR");

						if(res.money > temp) {
							g.slot_wins++;
							g.slot_won_money += (res.money - temp);
						} else {
							w = ":thumbsdown:";
							g.slot_loses++;
							g.slot_lose_money += (temp - res.money);
						};
						
						g.slot_games++;

						g.save().catch(err => log(err, "ERROR"));

						message.channel.send(base + w + " " + foot).then(n => {
							n.react("🔁").then(() => {
								const filter = (reaction, user) => reaction.emoji.name === "🔁" && user.id === message.author.id;
								const collector = new Discord.ReactionCollector(n, filter, {max: 1});
		
								collector.on("collect", () => {
									try {
										this.run(bot, message, args, data, settings, db);
									} catch(e) {};
								});
							}).catch(err => log(err, "ERROR"));
						});
					});
				}).catch(err => {
					log(err, "ERROR");

					if(data.lang === "fr") return sendE("Une erreur est survenu, vos gains ne seront peut être pas sauvegardés.");
					if(data.lang === "en") return sendE("An error has occurred, your winnings may not be saved.");
				});
			});
		} else {
			if(data.lang === "fr") return sendE("Arguments absents ou invalides. Synatxe: " + settings.prefix + "slot <bid>");
			if(data.lang === "en") return sendE("Absent or invalid arguments. Syntax: " + settings.prefix + "slot <bid>");
		};
	};
};