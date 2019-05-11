/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
require("dotenv").config();

const Discord = require("discord.js");
const Spotify = require("node-spotify-api");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const converter = require("../modules/hexConverter");
const colors = require("../assets/colors.json");
const moment = require("moment");
const request = require("request");

module.exports = class spotify {
	constructor() {
		this.name = "spotify",
		this.alias = [],
		this.usage = "/spotify <search>";
	};

	run(bot, message, args, data, settings, db) {
		var spotify = new Spotify({
			id: process.env.SPOTIFY_ID,
			secret: process.env.SPOTIFY_TOKEN
		});

		var log = (text, level) => logger(text, level, bot, __filename);

		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		if(args.length === 1) {
			if(data.lang === "fr") return sendE("Argument 'search' absent. Syntaxe: " + settings.prefix + "spotify <search>");
			if(data.lang === "en") return sendE("Argument 'search' absent. Syntax:" + settings.prefix + "spotify <search>");
		};

		args.shift();

		spotify.search({type: "track", query: args, limit: 1}).then(res => {
			if(res.tracks.items.length === 0) {
				if(data.lang === "fr") return sendE("Aucun resultat trouvé pour '" + args + "'.");
				if(data.lang === "en") return sendE("No results found for '" + args + "'.");
			};

			let infos = res.tracks.items[0];
			let duration, mn, s;

			mn = moment.duration(infos.duration_ms, "ms").minutes();
			s = moment.duration(infos.duration_ms, "ms").seconds();

			let embed = new Discord.RichEmbed({
				color: converter.hexToDec(colors.purple),
				author: {
					icon_url: process.env.SERVER + "/assets/thumbnails/spotify.png",
					name: infos.name,
					url: infos.external_urls.spotify
				},
				thumbnail: {
					url: infos.album.images[0].url
				}
			});

			let author;

			request(infos.artists[0].href, {auth: {bearer: spotify.token.access_token}}, (err, res, body) => {//why I don't use the stotify wrapper here?
				author = JSON.parse(body);

				let followers = author.followers.total.toLocaleString();

				if(data.lang === "fr") {
					duration = mn + " minutes " + s + " secondes";

					embed.setDescription("**Durée: " + duration + ", Popularité: " + infos.popularity + "/100**");
					
					if(author.id) {
						embed.addField("Artiste", "Nom: **[" + author.name + "](" + author.external_urls.spotify + ")**\nPopularité: **" + author.popularity + "/100**\n**" + followers + "** abonnés sur Spotify\nGenres musicaux: **" + author.genres.join(", ") + "**");
					} else {
						embed.addField("Artiste", "Aucune information n'a pû être obtenue sur l'artiste de ce titre.");
					};
				};
	
				if(data.lang === "en") {
					duration = mn + " minutes " + s + " seconds";

					embed.setDescription("**Duration: " + duration + ", Popularity: " + infos.popularity + "/100**");

					if(author.id) {
						embed.addField("Artist", "Name: **[" + author.name + "](" + author.external_urls.spotify + ")**\nPopularity: **" + author.popularity + "/100**\n**" + followers + "** followers on Spotify\nMusical genres: **" + author.genres.join(", ") + "**");
					} else {
						embed.addField("Artist", "No informations about the author for this song.");
					};
				};
	
				message.channel.send(embed).catch();
			});
		}).catch(function(err) {
			log(err, "ERROR");
			
			if(data.lang === "fr") return sendE("Une erreur est survenu lors de l'appel à l'API de Spotify.");
			if(data.lang === "en") return sendE("An error occurred when calling the Spotify API.");
		});
	};
};