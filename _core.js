// C O R E  server

var compiler = require('./_compile')
, http = require('http')
, router = require('./_route')
, scan = require('./_scan')
, bricoleur = require('./_brico')
, util = require('util')
, shoe = require('shoe');

var brico = new bricoleur();
var mapper = new scan({dir:'./_components'});
mapper.scan(function(json){
  brico.setMap(json);
});

compiler(['_components/core.js'],'_components/public/bundle.min.js'); // compile client side....

var server = http.createServer(router); // map requests to router
server.listen(8888);
var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { 
  // create streams here with func in brico
});
