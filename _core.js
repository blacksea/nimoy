// C O R E  server

var http = require('http')
, router = require('./_route')
, scan = require('./_scan')
, bricoleur = require('./_brico')
, compiler = require('./_compile')
, shoe = require('shoe');

compiler(['_components/core.js'],'_components/public/bundle.min.js'); // compile client side....

var server = http.createServer(router); 
server.listen(8888);

var brico = new bricoleur();
var mapper = new scan({dir:'./_components'});
mapper.scan(function(json){
  brico.init(json);
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { 
  // trigger create streams func in brico
});
