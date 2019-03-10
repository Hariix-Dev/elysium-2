const fs =require("fs");
const chalk = require("chalk");
const path = require("path");
const moment = require("moment");

var buildslog = JSON.parse(fs.readFileSync("./buildslog.json", "utf-8"));
var config = JSON.parse(fs.readFileSync("./assets/config.json", "utf-8"));

function log(message, type, bot) {
	var date = moment().format("DD/MM/YYYY");
	var time = moment().format("HH:mm:ss:SSS");

	if(!type) {
		ctype = chalk.green("INFO");
		type = "INFO";
	} else {
		ctype = type;
		if(type == "INFO") ctype = chalk.green("INFO");
		if(type == "WARN") ctype = chalk.yellow("WARN");
		if(type == "ERROR") ctype = chalk.red("ERROR");
		if(type == "DEBUG") ctype = chalk.cyan("DEBUG");
		if(type == "FATAL") ctype = chalk.bgRed("FATAL");
	};
	
	if(!message) {
		log("Le paramètre 'message' est obligatoire", "FATAL");
	} else {
		if(path.basename(__filename) == "app.js") {
			var filename = "MAIN";
		} else var filename = path.basename(__filename);
		var txt = chalk.magenta("[" + date + "] [" + time + "]") + " [" + chalk.gray(filename) + "/" + ctype + "] : " + message;
		var noColorTxt = "[" + date + "] [" + time + "] [" + filename + "/" + type + "] : " + message;

		console.log(txt);

		bot.channels.get(config.logChannel).send(noColorTxt).catch(error => {
			log("Message non envoyé: " + error, "WARN");
		});
		buildslog.push(noColorTxt);
		fs.writeFile("./buildslog.json", JSON.stringify(buildslog), (error) => {
			if(error) return log("Un événement n'a pas pu être inscrit dans le registre: " + error, "ERROR");
		});
	};

	if(type == "FATAL") return 1;
};

exports.log = function(message, type, bot, file) {
	var date = moment().format("DD/MM/YYYY");
	var time = moment().format("HH:mm:ss:SSS");

	if(!type) {
		ctype = chalk.green("INFO");
		type = "INFO";
	} else {
		if(type == "INFO") ctype = chalk.green("INFO");
		if(type == "WARN") ctype = chalk.yellow("WARN");
		if(type == "ERROR") ctype = chalk.red("ERROR");
		if(type == "DEBUG") ctype = chalk.cyan("DEBUG");
		if(type == "FATAL") ctype = chalk.bgRed("FATAL");
	};
	
	if(!message) {
		log("Le paramètre 'message' est obligatoire", "FATAL", bot);
	} else {
		var filename = path.basename(file);
		if(filename == "app.js") filename = "MAIN";
		var txt = chalk.magenta("[" + date + "] [" + time + "]") + " [" + chalk.gray(filename) + "/" + ctype + "] : " + message;
		var noColorTxt = "[" + date + "] [" + time + "] [" + filename + "/" + type + "] : " + message;

		console.log(txt);

		bot.channels.get(config.logChannel).send(noColorTxt).catch(error => {
			log("Message non envoyé: " + error, "WARN", bot);
		});
		buildslog.push(noColorTxt);
		fs.writeFile("./buildslog.json", JSON.stringify(buildslog), (error) => {
			if(error) return log("Un événement n'a pas pu être inscrit dans le registre: " + error, "ERROR", bot);
		});
	};
};