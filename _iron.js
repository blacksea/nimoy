
// W A F F L E  I R O N

// event map / save map?
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

	iron.buildModules = function (callback) {
		fs.readFile(iron.settingsJSON, function (err, json) {
			iron.settings = JSON.parse(json.toString());
			fs.readFile(iron.settings.path_modules+'/package.json', function (err, json) {
				var obj = JSON.parse(json.toString());
				iron.modules = obj.modules;
				async.forEach(iron.modules, function (module, cb) {
					async.forEach(module.files, function (file, cbb) {
						
						cbb();
					}, function () {
						cb();
					});
				},
				function () {
					callback();
				});
			});
		});
	}

	iron.buildJS = function (callback) {
		var js = '';
		fs.unlink(iron.settings.path_js, function () {
			async.forEach(iron.registry, function (module, cb) {
				client.hget(module, 'client_js', function (err, jsData) {
					js += jsData;
					cb();
				});
			}, function () {
				fs.writeFile(iron.settings.path_js, js, function () {
					new compressor.minify({
				    type: 'uglifyjs',
				    fileIn: iron.settings.path_js,
				    fileOut: iron.settings.path_js.replace('.js','.min.js'),
				    callback: function(err){
			        console.log(err);
    					console.log('scripts.js ready!');
							callback();
				    }
					});
				});	
			}); 
		});
	}

	iron.buildFrame = function (cb) {
		fs.readFile(iron.settings.path_template, function (err, data) {
			var frame = templayed(data.toString())({modules:''});
			client.set('frame', frame);
			console.log('master template ready!');
			cb();
		});
	}

	iron.createFrame = function (req, res) {	
		client.get('frame', function (err, frame) {
			console.log(frame);
			res.end(frame);
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

	iron.newModule = function (module, cb) {
		console.log('new module '+module);
		var notFound = true;
		for(var i=0;i<iron.registry.length;i++) {
			if(module==iron.registry[i]){
				notFound = false;
				client.hget(module, 'pkg', function (err, json) {
					var pkg = JSON.parse(json);
					if (pkg.files.server) {
						iron.loadModule(module);
					}
					if (pkg.files.client) {
						client.hget(module, 'client_html', function (err, html) {
							// var pakdHTML = msgpack.encode(html.toString());
							cb(['Waffle', 'loadModule', [module, html]]);
						});
					} else if (!pkg.files.client) {
						cb(['skeleton', 'log', 'loading server module '+module]);
					}
				});
				break;
			} 
		}
		if(notFound==true) cb(['skeleton', 'log', "module doesn't exist"]); 
	}

	iron.generateModule = function (module, callback) {
		var moduleExists = false;
		for(var i=0;i<iron.registry.length;i++){
			if(module==iron.registry[i]){
				callback(['skeleton','log', module+' already exists doooofus!!!']);
				moduleExists = true;
				break;
			}
		}
		if (moduleExists==false) {
			var modulePath = iron.settings.path_modules+module,
			files = [module+'.html',module+'Client.js',module+'.js',module+'.styl'];
			fs.mkdir(modulePath, function(){
				var pkg = {
					name : module,
					version : '0',
					files : {
						client : {
							html : module+'.html',
							css : module+'.styl',
							js : module+'Client.js'
						},
						server : {
							js : module+'.js'
						}
					}
				}
				fs.writeFile(modulePath+'/package.json', JSON.stringify(pkg, null, '\t'), function () {
					async.forEach(files, function (file, cb) {
						fs.writeFile(modulePath+'/'+file, '', function () {
							cb();
						});
					}, function () {
						iron.buildRegistry(function () {
							callback(['skeleton','log','generated new module '+module]);
						});
					});
				});
			});
		}
	}

	iron.removeModule = function (module, cb) {
		for(var i=0;i<iron.registry.length;i++){
			if(module==iron.registry[i]){
				rimraf(iron.settings.path_modules+module, function (err) {
					console.log(err);
					iron.buildRegistry(function () {
						cb(['skeleton','log', module+' liquidated!']);
					});
				});
				break;
			}
		}
	}

	iron.call = function (call, cb) {
		console.log(call);
		var params = call.split('|')
		, module   = params[0]
		, method   = params[1]
		, args     = params[2]; 
		cb([module, method, args]);
	}

	iron.compile = function (action, cb) {
		switch(action) {
			case 'html'  : iron.buildRegistry(function(){
				iron.buildHTML(function(){
					cb(['skeleton', 'log', 'html rebuilt']);
				}); 
			});	break;
			case 'js'    : iron.buildRegistry(function(){
				iron.buildJS(function(){
					cb(['skeleton', 'log', 'js rebuilt']);
				}); 
			}); break;
			case 'css'   : iron.buildRegistry(function(){
				iron.buildCSS(function(){
					cb(['skeleton', 'log', 'css rebuilt']);
				}); 
			}); break;
			case 'frame' : iron.buildRegistry(function(){
				iron.buildFrame(function(){
					cb(['skeleton', 'log', 'frame rebuilt']);
				});
			}); break;
		} 
		if(action!='html'&&action!='js'&&action!='css'&&action!='frame'){
			cb(['skeleton', 'log', 'that cannot be compiled']);
		}
	}

}

global['iron'] = new Iron();
exports = module.exports = iron;