/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const Discord = require("discord.js");
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");
const queue = new Map();

module.exports = class play {
	constructor() {
		this.name = "play",
		this.alias = [],
		this.usage = "/play <title>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);
		//check if music plugin is enable

		let musicChannel;
		if(settings.musicChannel == 0) {
			if(!message.member.voiceChannel) {
				if(data.lang === "fr") return sendE("Vous devez d'abord rejoindre un salon vocal.");
				if(data.lang === "en") return sendE("You must first join a voice salon.");
			} else musicChannel = message.member.voiceChannel;
		} else {
			let temp = message.guild.channels.find(temp => temp.id === settings.musicChannel && temp.type === "voice");

			if(!temp) {
				if(data.lang === "fr") sendE("Le salon vocal par défaut n'a pas été trouvé... Mettez à jour la configuration du bot.");
				if(data.lang === "en") sendE("The default voice channel was not found... Update the bot config.");

				musicChannel = message.member.voiceChannel;
			} else musicChannel = temp;
		};

		musicChannel.join().then(() => {
			message.channel.send("OK!");
		}).catch(err => {
			log(err, "ERROR");

			if(data.lang === "fr") return sendE("Je ne peux pas rejoindre ce salon...");
			if(data.lang === "en") return sendE("I can't join this channel...");
		});
	};
};