/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
const mongoose = require("mongoose");

const GlobalsSchema = mongoose.Schema({
	user_id: String,
	lang: String,
	memes: Array,
	jokes: Array,

	slot_wins: Number,
	slot_games: Number,
	slot_loses: Number,

	slot_lose_money: Number,
	slot_won_money: Number,

	rps_wins: Number,
	rps_games: Number,
	rps_loses: Number
});

module.exports = mongoose.model("Globals", GlobalsSchema);