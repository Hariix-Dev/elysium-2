/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/
const sparkly = require("sparkly");

module.exports = class spikes {
	constructor() {
		this.name = "spikes",
		this.alias = ["spike"],
		this.usage = "spikes";
	};

	run(bot, message, args, data, settings, db) {
		let spikes = sparkly([10, 2, 4, 2, 5, 6, 10, 5], {
			min: 0,
			max: 10
		});

		message.channel.send("Command not complete.");
	};
};