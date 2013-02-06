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
, uglifyJS = require('uglify-js');

// bundle browser side code
var bundle = browserify('./_core_client.js').bundle();
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
	var stream = fs.createReadStream('_components/public/frame.html');
  stream.on('open', function () {
	  stream.pipe(res);
	});
});

server.listen(8888);

var sock = shoe(function (stream) {
    var iv = setInterval(function () {
        stream.write(Math.floor(Math.random() * 2));
    }, 250);
    stream.on('end', function () {
        clearInterval(iv);
    });
    stream.pipe(process.stdout, { end : false });
});

sock.install(server, '/bus');
