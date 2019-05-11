/* jshint esversion: 6 */
/* jshint -W032 */
/* ts -80001*/

module.exports.binToDec = function(bin) {
	let dec = parseInt(bin, 2);
	return dec;
};

module.exports.decToBin = function(dec) {
	let bin = (+dec).toString(2);
	return bin;
};