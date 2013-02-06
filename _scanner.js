/* S C A N N E R
	reads and handles
 */

var fs = require('fs');

module.exports = function (dir) {
	var self = this;
	fs.readdir(dir, function (err, files) {
		for(var i=0;i<files.length;i++){ // ignore hidden files
			if(files[i][0]==='.') files.splice(i,1);
		}
		process(files);
	});	
	function process (files) {
		console.log(files);
	}
}