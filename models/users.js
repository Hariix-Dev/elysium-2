/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
const mongoose = require("mongoose");

const UsersSchema = mongoose.Schema({
	user_id: String,
	server_id: String,
	lang: String,
	messages: Number,
	caracters: Number,
	money: Number,
	xp: Number,
	level: Number,
	bans: Number,
	kicks: Number,
	permissions: Array
});

module.exports = mongoose.model("Users", UsersSchema);