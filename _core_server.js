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

var bundle = browserify().bundle('./_core_client.js');
var result = uglifyJS.minify(bundle, {fromString:true});
fs.writeFile('./_components/public/bundle.min.js', result.code, function(err) {
		if (err) console.log(err);
});

var iron = new shell;
// var bricolo = new brico('./_components');

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('_components/public'))
, server = require('http').createServer(app);

app.use(function(req, res) {
	fs.readStream()
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
