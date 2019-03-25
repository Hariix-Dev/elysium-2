/* jshint esversion: 6 */
/* jshint -W032 */
const config = require("../assets/config.json");
const chalk = require("chalk");
const moment = require("moment");

module.exports = (message, level, bot) => {
	var date = moment().format("DD/MM/YYYY");
	var time = moment().format("HH:mm:ss:SSS");

	var colored = {};

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

		default: colored.level = chalk.green(level);
	};

	if(!message) {
		message = "Le paramêtre 'message' est obligatoire.";
		colored.level = chalk.red(level);
	};

	console.log(`${chalk.magenta(`[${date}] [${time}]`)} [${chalk.gray("MAIN")}/${colored.level}] : ${message}`);
	bot.channels.get(config.logId).send(`[${date}] [${time}] [MAIN/${level}] : ${message}`).catch();
};