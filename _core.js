// C O R E  server
var shell = require('./_shell')
// , brico = require('./_brico')
, http = require('http')
, browserify = require('browserify')
, shoe = require('shoe')
, fs = require('fs')
, filed = require('filed')
, compiler = require('./_compile')
, router = require('./_route')
, uglifyJS = require('uglify-js');
var iron = new shell;
compiler(['_components/core.js'],'_components/bundle.min.js'); // compile client side....
var server = http.createServer(router); // map requests to router
server.listen(8888);
var sock = shoe(iron.Stream);
sock.on('connection', iron.Conn); // create streams now
sock.install(server, '/bus');

// port shell to client side & connect to core // wire up brico to add client modules
