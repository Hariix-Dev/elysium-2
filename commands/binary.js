/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");

module.exports = class binary {
	constructor() {
		this.name = "binary",
		this.alias = [],
		this.usage = "/binary <message>";
	};

	run(bot, message, args, data, settings, db) {
		var sendE = (text, timeout) => reply.sendError(text, message, timeout);

		args.shift();
		let text = args.join(" ");

		var value = text.split("").map(function(char) {
			return char.charCodeAt(0).toString(2);
		}).join(" ");

		value = "0" + value;

		if(value.length >= 2000) {
			if(data.lang === "fr") return sendE("La conversion est trop longue pour discord. Cette erreur sera corrigé dans la version payante grâce à un \"multipart\" des messages.");
			if(data.lang === "en") return sendE("The conversion is too long for discord. This error will be fixed in the paid version with a \"multipart\" of messages.");
		};

		message.channel.send(value).catch();
	};
};