// C O R E  server

var compiler = require('./_compile')
, http = require('http')
, router = require('./_route')
, MuxDemux = require('mux-demux')
, bricoleur = require('./_brico')
, shoe = require('shoe');

compiler(['_components/core.js'],'_components/public/bundle.min.js'); // compile client side....

var server = http.createServer(router); // map requests to router
server.listen(8888);

// brico
var brio = new brico('./_components');

var sock = shoe(iron.Stream);
sock.on('connection', iron.createChannel); // create streams now
sock.install(server, '/bus');

// use brico to manage modules / streams 
// -- add modules -- patch them in
