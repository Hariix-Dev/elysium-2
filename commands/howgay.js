/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const reply = require("../modules/replyEmbed");

module.exports = class howgay {
	constructor() {
		this.name = "howgay",
		this.alias = [],
		this.en = "Tell you how gay you are.",
		this.fr = "Dis à combien vous êtes gay.",
		this.usage = "/howgay [@user]";
	};

	run(bot, message, args, data, settings, db) {
		const sendE = (text, timeout) => reply.sendError(text, message, timeout);

		if(args.length === 1) {
			let gay = message.author.id.toString().slice(0, 2);

			if(data.lang === "fr") return message.channel.send(message.author.tag + " est gay à **" + gay + "%**.");
			if(data.lang === "en") return message.channel.send(message.author.tag + " is **" + gay + "%** gay.");
		} else {
			const mUser = message.mentions.users.first() || bot.users.get(args[1]);

			if(!mUser) {
				if(data.lang === "fr") return sendE("Je n'ai pas trouvée cette utilisateur.");
				if(data.lang === "en") return sendE("Couldn't find this user.");
			};

			let gay = mUser.id.toString().slice(0, 2);

			if(data.lang === "fr") return message.channel.send(mUser.tag + " est gay à **" + gay + "%**.");
			if(data.lang === "en") return message.channel.send(mUser.tag + " is **" + gay + "%** gay.");
		};
	};
};