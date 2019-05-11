/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
const mongoose = require("mongoose");

const ServersSchema = mongoose.Schema({
	server_id: String,
	prefix: String,
	lang: String,
	money_char: String,
	start_money: Number,
	announcements_channel_id: String,
	music_voice_id: String,
	options: Number
});

module.exports = mongoose.model("Servers", ServersSchema);