/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/
const mongoose = require("mongoose");

const ReportsSchema = mongoose.Schema({
	server_id: String,
	user_id: String,
	by: String,
	reason: String,
	time: Date
});

module.exports = mongoose.model("Reports", ReportsSchema);