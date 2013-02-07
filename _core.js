// C O R E
var shell = require('./_shell')
, brico = require('./_brico')
, http = require('http')
, browserify = require('browserify')
, shoe = require('shoe')
, fs = require('fs')
, filed = require('filed')
, uglifyJS = require('uglify-js');
var iron = new shell;

var server = http.createServer(function (req, res) { // pass in a module/function instead
});
server.listen(8888);
/////////////////////////////////////////////////////////////

var sock = shoe(iron.Stream);
sock.on('connection', iron.Conn); // create streams now
sock.install(server, '/bus');
