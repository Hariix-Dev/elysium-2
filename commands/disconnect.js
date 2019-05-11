/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");
const logger = require("../modules/logger");

module.exports = class disconnect {
	constructor() {
		this.name = "disconnect",
		this.alias = [],
		this.usage = "/disconnect";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);
		var sendC = (text, timeout) => reply.sendConfirm(text, message, timeout);

		const log = (message, level) => logger(message, level, bot, __filename);

		message.delete().catch();

		if(!message.guild.voiceConnection) {
			if(data.lang === "fr") return sendE("Je ne suis connecté à aucun salon vocal sur ce serveur.");
			if(data.lang === "en") return sendE("I am not connected to any voice salon on this server.");
		};

		try {
			message.guild.voiceConnection.disconnect();
		} catch (err) {
			log(err, "ERROR");

			if(data.lang === "fr") return sendE("Une erreur est survenue.");
			if(data.lang === "en") return sendE("An error has occured.");
		};

		if(data.lang) return sendC("Je me suis déconnecter du salon vocal.", 25);
		if(data.lang) return sendC("I disconnected from the voice channel.", 25);
	};
};