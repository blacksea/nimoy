/* C O R E 
	app setup
*/
var shell = require('./_shell')
, brico = require('./_brico')
, connect = require('connect')
, http = require('http')
, browserify = require('browserify')
, shoe = require('shoe')
, fs = require('fs')
, filed = require('filed')
, uglifyJS = require('uglify-js');

// bundle browser side code
var bundle = browserify('./_components/core.js').bundle();
var bundleMin = uglifyJS.minify(bundle, {fromString:true});
fs.writeFile('./_components/public/bundle.min.js', bundleMin.code, function(err) {
		if (err) console.log(err);
});

var iron = new shell;

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('_components/public'))
, server = require('http').createServer(app);

app.use(function(req, res) { // handle http responses
	res.setHeader("Content-Type", "text/html");
  filed('_components/public/frame.html').pipe(res);
});

server.listen(8888);

var sock = shoe(function (stream) {
});

sock.on('connection', function (conn) {
	console.log(conn);
	console.log(sock);
});

sock.install(server, '/bus');
