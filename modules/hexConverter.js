/*jshint esversion: 6 */
/*jshint -W032 */

module.exports.hexToDec = function(string) {
	var dec = parseInt(string, 16);
	return dec;
};

module.exports.decToHex = function(number) {
	var hex = number.toString(16);
	return hex;
};