// SERVER

Object._ = function(){} // create a global scope for modules

var Bricoleur = require('./_brico')
, Precompiler = require('./_pre')
, Mapper = require('./_map')
, User = require('./_usr')
, Router = require('./_rtr')
, http = require('http')
, shoe = require('shoe');

var usr = new User(); // user hack :(
var router = new Router(usr.def.routes);
var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var brico = new Bricoleur();
var map = new Mapper('./_wilds');

map.scan(function () { 
  var pre = new Precompiler({ 
    src : map.client_files,
    dst : './_wilds/bundle.min.js',
    compress : true
  }, function (msg) {
    console.log(msg);
  }); 
  brico.init(map.map_server);
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { // trigger create streams func in brico
  var x = brico.stream.createStream('brico');
  x.write(['init',map.map_client]);
});
