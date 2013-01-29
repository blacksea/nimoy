
//  W A F F L E  I R O N  C L A S S

//-----------------------------------------------------	
//  M O D U L E S

var templayed = require('templayed')
, compressor  = require('node-minify')
, msgpack     = require('msgpack-js')
, rimraf      = require('rimraf')
, async       = require('async')
, path        = require('path')
, http        = require('http')
, fs    		  = require('fs')
, bus         = require('./_bus.js')
, redis       = require('redis')
, client      = redis.createClient();

var Iron = function () {
	
	var iron = this;

	//-----------------------------------------------------	
	//  S E T U P

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
			handleJS(function () {
				status();
			});
			getFrame(function () {
				status();
			});
			function status () {
			  if(loaded_js==true&&loaded_frame==true){
			  	callback();
			  }
			}
			function getFrame (callback) {
			  fs.readFile(iron.info.config_frame, function (err, buffer) {
			  	var defaultModules = JSON.stringify(iron.user.default_modules);
			  	var file = buffer.toString()
			  	, html   = templayed(file)({default_modules:defaultModules});
			  	client.set('master_template', html, redis.print);
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
								clientJS += '\n ui.markup = "'+buffer.toString()+'";\n ui.templates = document.createElement("div");\n ui.templates.innerHTML = ui.markup;';
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

	//-----------------------------------------------------	
	//  H T T P  R E Q U E S T S

	iron.req = function (req, res) {
		client.get('master_template', function (err, buffer) {
			res.end(buffer.toString());
		});
	}

	//-----------------------------------------------------	
	//  I N T E R P R E T E R
	
	iron.interpret = function (paramArray, cb) {
		var senderModule = paramArray[0]
		, senderMethod   = paramArray[1]
		, cmd            = paramArray[2].split(' ')
		, arrayToSend    = []
		, notFound			 = true;
		for (command in iron.info.commands) {	
			if (command==cmd[0]) { // matched command ex. / for new
				notFound = false;
				var action = iron.info.commands[command].split('|')
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

	//-----------------------------------------------------	
	//  D A T A  H E L P E R S
	
	iron.getData = function (array, cb) {
		client.hmget(iron.user.name, array, function (err, data) {
			cb(data);
		});
	}

	iron.setData = function (array, cb) {
		client.hmset(iron.user.name, array[0], array[1], function () {
		});
	}

	//-----------------------------------------------------	
	//  D A T A  I N T E R F A C E

	// create an api for data handling 

	iron.createUser = function (name, cb) {
		client.hset(name, 'default_modules', iron.user.default_modules, function () {
			cb(['skeleton', 'log', 'created user: '+name]);
		});
	}
	
	iron.printUser = function () {
			
	}
	
	iron.env_snapshot = function () {

	}
	
	iron.recHistory = function (data) {
		var json = JSON.stringify(data);
		bus.sendGlobal(data);
		iron.setData(['env', json]);
	}
	
	iron.playHistory = function (fk, cb) {
		iron.getData(['env'], function (data) {
			var uj = JSON.parse(data);
			cb(uj);
		});
	}
	
	iron.readHistory = function () {
		
	}

}

global['iron'] = new Iron();
exports = module.exports = iron;