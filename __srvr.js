// SERVER

Object._ = function(){} // create a global scope for modules

var Bricoleur = require('./_brico')
, Precompiler = require('./_pre')
, Mapper = require('./_map')
, Router = require('./_rtr')
, User = require('./_usr')
, http = require('http')
, shoe = require('shoe');

var brico = new Bricoleur({scope:'server',deps:['data']});
var pre = new Precompiler({compress:false,src:['./__clnt.js'],dst:'./_wilds/_scripts.min.js',css:'./_wilds/_styles.css'});

var usr = new User(); 
var router = new Router(usr.def.routes);
var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var map = new Mapper('./_wilds'); // begin mapping wilds
map.client.on('data', pre.handleData); // stream client map to precompiler
map.client.on('end', pre.compile);
map.server.on('data', brico.HandleData); // stream server map to brico

var sock = shoe(function(stream){
  stream.pipe(brico.Stream).pipe(stream);
});

sock.install(server, '/bus');

sock.on('connection', function(conn) { // trigger create streams func in brico
  var x = brico.Stream.createStream('brico');
  // pass client modules to brico
  x.write(['addMod',{id:'conosole',scope:['client'],filepath:'./_wilds/console.js'}]); // init user modules 
});
