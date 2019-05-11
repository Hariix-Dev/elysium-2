/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
const mongoose = require("mongoose");

const BansSchema = mongoose.Schema({
	server_id: String,
	user_id: String,
	admin_id: String,
	time: Date,
	reason: String,
	duration: String
});

module.exports = mongoose.model("Bans", BansSchema);