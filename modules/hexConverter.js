/*jshint esversion: 6 */
/*jshint -W032 */

module.exports.hexToDec = function(string) {
	let dec = parseInt(string, 16);
	return dec;
};

module.exports.decToHex = function(number) {
	let hex = number.toString(16);
	return hex;
};