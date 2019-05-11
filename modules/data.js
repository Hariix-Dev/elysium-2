/*jshint esversion: 6 */
/*jshint -W032 */
const fs = require("fs");

exports.getFileSize = function(file) {
    let stats = fs.statSync(file);
    let fileSizeInBytes = stats.size;
    return fileSizeInBytes;
};

exports.toMB = function(bytes) {
	let mb = bytes / 125000;
	return mb;
};

exports.toGB = function(bytes) {
	let gb = bytes / 125000000;
	return gb;
};

exports.toBytes = function(mb) {
	let bytes = mb * 1000000;
	return bytes;
};