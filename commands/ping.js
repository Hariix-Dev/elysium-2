/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/

module.exports = class ping {
	constructor() {
		this.name = "ping",
		this.alias = [],
		this.en = "Give the ping.",
		this.fr = "Donne la latence.",
		this.usage = "/ping";
	};

	run(bot, message, args, data, settings, db) {
		let start = Date.now();
		message.delete().catch();
		
		message.channel.send("Pong!").then(temp => {
			let diff = (Date.now() - start);
			temp.edit("Pong! **" + diff + "ms**. API Ping: **" + (bot.ping).toFixed(3) + "ms**.").catch();

			setTimeout(function() {
				temp.delete().catch();
			}, 30000);
		}).catch();
	};
};