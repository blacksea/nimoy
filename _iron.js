
// W A F F L E  I R O N

// do error handling

var templayed = require('templayed')
, compressor	= require('node-minify')
, msgpack     = require('msgpack-js')
, rimraf      = require('rimraf')
, async       = require('async')
, path        = require('path')
, http        = require('http')
, fs    		  = require('fs')
, redis       = require('redis')
, client      = redis.createClient();

var Iron = function () {
	
	var iron = this;

	iron.readJson = function (callback) {
		fs.readdir('./', function (err, files) {
			async.forEach(files, function (file, cb) {
				var format = file.split('.')[1];
				if (format=='json'&&file!='package.json'){
					fs.readFile(file, function (err, buffer) {
						var propertyName = file.replace('_','').replace('.json','')
						, json = buffer.toString();
						iron[propertyName] = JSON.parse(json);
						cb();
					});
				} else {
					cb();
				}
			}, function () {
				callback();
			});
		});
	}
	iron.setup = function (callback) {
		var loaded_frame = false
		, loaded_css    = false
		, loaded_js     = false;

		fs.readFile(iron.info.config_ui, function (err, buffer) { // ui
			var json  = buffer.toString();
			iron.ui = JSON.parse(json);
			handleCSS(function () {
				status();
			});
			handleJS(function () {
				status();
			});
			getFrame(function () {
				status();
			});
			function status () {
			  if(loaded_css==true&&loaded_js==true&&loaded_frame==true){
			  	callback();
			  }
			}
			function getFrame (callback) {
			  fs.readFile(iron.info.config_frame, function (err, buffer) {
			  	client.set('master_template', buffer, redis.print);
			  	loaded_frame = true;
			  	callback();
			  });
			}
			function handleCSS (callback) {
				fs.readFile(iron.ui.local_css, function (err, buffer) {
					fs.unlink(iron.ui.public_css, function () {
						fs.writeFile(iron.ui.public_css, buffer, function (err) {
							loaded_css = true;
							callback();
						});
					});
				});
			}
			function handleJS (callback) {
				fs.readFile(iron.info.config_modules, function (err, buffer) {
					var json   = buffer.toString()
					, clientJS = '';
				  iron.modules  = JSON.parse(json);
					async.forEach(iron.modules.client, function (module, cb) {
						fs.readFile('./mods/'+module.file, function (err, buffer) {
							clientJS += '\n'+buffer.toString();
							cb();
						});	
					}, function () {
						fs.readFile(iron.ui.js, function (err, buffer) { // add ui script
							clientJS += buffer.toString();
							fs.readFile(iron.ui.templates, function (err, buffer) {
								clientJS += '\n ui.templates = "'+buffer.toString()+'";';
								fs.unlink(iron.info.compiled_modules, function () {
									fs.writeFile(iron.info.compiled_modules, clientJS, function () {
										new compressor.minify({
										    type: 'uglifyjs',
										    fileIn: iron.info.compiled_modules,
										    fileOut: iron.info.compiled_modules.replace('.js','.min.js'),
										    callback: function(err){
										        console.log(err);
	        									loaded_js = true;
														callback();
										    }
										});
									});
								});
							});
						});	
					});
				});
			}
		});
	}
	iron.req = function (req, res) {
		client.get('master_template', function (err, buffer) {
			res.end(buffer.toString());
		});
	}
	iron.interpret = function (paramArray, cb) {
		var senderModule = paramArray[0]
		, senderMethod   = paramArray[1]
		, cmd            = paramArray[2].split(' ')
		, arrayToSend    = []
		, notFound			 = true;
		for (command in iron.settings.commands) {	
			if (command==cmd[0]) { // matched command ex. / for new
				notFound = false;
				var action = iron.settings.commands[command].split('|')
				, module   = action[0]
				, method   = action[1]
				, param    = cmd[1];
				global[module][method](param, function (paramArray) {
					arrayToSend = paramArray;
					cb(arrayToSend);
				}); 
				break;
			} 
		}
		if(notFound==true){
			cb(['skeleton', 'log', 'command not found']);
		}
	}

}

global['iron'] = new Iron();
exports = module.exports = iron;