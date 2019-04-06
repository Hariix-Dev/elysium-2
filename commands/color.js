/* jshint esversion: 6 */
/* jshint -W032 */
/* jshint -W030*/

module.exports = class randomcolor {
	constructor() {
		this.name = "randomcolor",
		this.alias = ["color"],
		this.usage = "/randomcolor";
	};

	run(bot, message, args, data, settings, db) {
		message.delete().catch();

		let dec = Math.floor(Math.random() * 16777215);
		let r = (dec & 0xff0000) >> 16;
		let g = (dec & 0x00ff00) >> 8;
		let b = (dec & 0x0000ff);
		let rgb = "R: **" + r + "** G: **" + g + "** B: **" + b + "**";
		let rgbp = "R: **" + Math.floor(r / 2.55) + "%** G: **" + Math.floor(g / 2.55) + "%** B: **" + Math.floor(b / 2.55) + "%**";

		message.channel.send(message, {embed: {
			color: dec,
			description: "Décimal: **" + dec + "**\nHéxadécimal: **#" + ("000000" + dec.toString(16)).slice(-6) + "**\nRGB: " + rgb + "\nRGBP: " + rgbp
		}});
	};
};