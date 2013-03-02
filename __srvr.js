// SERVER

Object._ = function(){} // create a global scope for modules

var Bricoleur = require('./_brico')
, Precompiler = require('./_pre')
, Mapper = require('./_map')
, User = require('./_usr')
, Router = require('./_rtr')
, http = require('http')
, shoe = require('shoe');

var brico = new Bricoleur();
var pre = new Precompiler();
var usr = new User(); // user hack :(
var router = new Router(usr.def.routes);

var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var map = new Mapper('./_wilds'); // begin mapping wilds
map.client.on('data', pre.handleData); // stream client map to precompiler
map.server.on('data', brico.handleData); // stream server map to brico

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});

sock.install(server, '/bus');

sock.on('connection', function(conn) { // trigger create streams func in brico
  var x = brico.stream.createStream('brico');
  x.write(['init',map.map_client]);
});
