/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");

module.exports = class joke {
	constructor() {
		this.name = "joke",
		this.alias = [],
		this.usage = "/joke";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		if(data.lang === "fr") return sendE("Erreur 404: Aucun humour trouvé!");
		if(data.lang === "en") return sendE("Error 404: Humor module not found!");
	};
};