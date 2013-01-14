
// W A F F L E  I R O N

// event map / save map?
var templayed = require('templayed')
, compressor	= require('node-minify')
, msgpack     = require('msgpack-js')
, async       = require('async')
, path        = require('path')
, http        = require('http')
, fs    		  = require('fs')
, redis       = require('redis')
, client      = redis.createClient();

var Iron = function () {
	
	var iron = this;
	iron.templates = {};

	iron.buildRegistry = function (callback) {
		iron.registry = [];
		client.del('registry');
		fs.readFile('./settings.json', function (err, json) {
			iron.settings = JSON.parse(json);
			fs.readdir(iron.settings.path_modules, function (err, modules) {
				async.forEach(modules, handleModule, function () {
					callback();
				});
			});
		});
		function handleModule (module, cb) {
			client.lpush('registry', module);
			iron.registry.push(module);
		  fs.readFile(iron.settings.path_modules+module+'/package.json', function (err, jsonBuf) {
		  	var pkg = JSON.parse(jsonBuf.toString()),
		  	allFiles = [];
		  	client.del(pkg.name);
		  	if (pkg.files.client) addFiles(pkg.files.client, 'client');
		  	if (pkg.files.server) addFiles(pkg.files.server, 'server');
		  	function addFiles (files, scope) {
		  		for(file in files){
		  			var item = [pkg.name, file, files[file], scope];
		  			allFiles.push(item);
		  		}
		  	}
		  	client.hset(pkg.name, 'pkg', jsonBuf.toString(), function () {
		  		async.forEach(allFiles, function (pkgArray, cb) {
	  				var module = pkgArray[0]
	  				, file       = pkgArray[1]
	  				, fileName   = pkgArray[2]
	  				, scope      = pkgArray[3]
			  		, filePath   = iron.settings.path_modules+module+'/'+fileName;
			  		fs.readFile(filePath, function (err, dataBuf) {
			  			client.hset(module, scope+'_'+file, dataBuf, function () {
				  			cb();
			  			});
			  		});
			  	}, function () {
			  		cb();
			  	});
		  	});
		  });
		}
	}

	iron.buildHTML = function (callback) {
		async.forEach(iron.registry, function (module, cb) {
			client.hget(module, 'client_html', function (err, html) {
				iron.templates[module] = html;
				cb();
			});
		}, function () {
			console.log('Templates ready!');
			callback();
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

	iron.buildCSS = function (callback) {
		var css = '';
		fs.unlink(iron.settings.path_css, function () {
			async.forEach(iron.registry, function (module, cb) {
				client.hget(module, 'client_css', function (err, cssData) {
					css += cssData;
					cb();
				});			
			}, function () {
				fs.writeFile(iron.settings.path_css, css, function () {
					console.log("css ready!");
					callback();
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

	iron.sendTemplates = function (paramArray, cb) {
		console.log('templates requested');
		var json = JSON.stringify(iron.templates),
		templates = msgpack.encode(json);
		console.log('sending templates');
		cb(['Waffle', 'spread', templates]);
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
							console.log(html);
							console.log(html.toString());
							var pakdHTML = msgpack.encode(html.toString());
							cb(['Waffle', 'loadModule', [module, pakdHTML]]);
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

	iron.loadModule = function (module) {
		client.hget(module, 'pkg', function (err, json) {
			var pkg = JSON.parse(json);
			var moduleFile = iron.settings.path_modules+module+'/'+pkg.files.server.js;
			global[module] = require(moduleFile);
			global[module].init();
		});
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