// C O R E  server

var compiler = require('./_compile')
, router = require('./_route')
, brico = require('./_brico')
, shell = require('./_shell')
, http = require('http')
, shoe = require('shoe');

compiler(['_components/core.js'],'_components/public/bundle.min.js'); // compile client side....

var server = http.createServer(router); // map requests to router
server.listen(8888);

// brico
var brio = new brico('./_components');
var iron = new shell;

var sock = shoe(iron.Stream);
sock.on('connection', iron.createChannel); // create streams now
sock.install(server, '/bus');

// port shell to client side & connect to core // wire up brico to add client modules
