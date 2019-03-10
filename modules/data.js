/*jshint esversion: 6 */
/*jshint -W032 */

const fs = require("fs");

exports.getFileSize = function(file) {
    var stats = fs.statSync(file);
    var fileSizeInBytes = stats.size;
    return fileSizeInBytes;
};

exports.toMB = function(bytes) {
	var mb = bytes / 125000;
	return mb;
};

exports.toGB = function(bytes) {
	var gb = bytes / 125000000;
	return gb;
};

exports.toBytes = function(mb) {
	var bytes = mb * 1000000;
	return bytes;
};