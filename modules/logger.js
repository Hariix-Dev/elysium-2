/* jshint esversion: 6 */
/* jshint -W032 */
const config = require("../assets/config.json");
const chalk = require("chalk");
const moment = require("moment");
const path = require("path");

module.exports = (message, level, bot, filepath) => {
	var date = moment().format("DD/MM/YYYY");
	var time = moment().format("HH:mm:ss:SSS");

	var colored = {};

	var source = path.basename(filepath);

	if(source === "app.js") source = "MAIN";

	switch(level) {
		case "INFO":
			colored.level = chalk.green(level);
		break;

		case "DEBUG": 
			colored.level = chalk.cyan(level);
		break;

		case "WARN":
			colored.level = chalk.yellow(level);
		break;

		case "ERROR":
			colored.level = chalk.red(level);
		break;

		case "FATAL":
			colored.level = chalk.bgRed(level);
		break;

		default:
			colored.level = chalk.green("INFO");
			level = "INFO";
		break;
	};



	if(!message) {
		message = "Le paramêtre 'message' est obligatoire.";
		colored.level = chalk.red("ERROR");
	};

	console.log(`${chalk.magenta(`[${date}] [${time}]`)} [${chalk.gray(source)}/${colored.level}] : ${message}`);

	if(message.length > 2000) {
		if(level === "FATAL") process.exit(1);
		return;
	};

	bot.channels.get(config.logId).send(`[${date}] [${time}] [${source}/${level}] : ${message}`).then(() => {
		if(level === "FATAL") process.exit(1);
	}).catch(err => console.log("Un évenement n'a pas pû être affiché"));
};