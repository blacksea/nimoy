// SERVER

Object._ = function(){} // create a global scope for modules

var Bricoleur = require('./_brico')
, Precompiler = require('./_pre')
, Mapper = require('./_map')
, Router = require('./_rtr')
, User = require('./_usr')
, http = require('http')
, shoe = require('shoe');

var brico = new Bricoleur({scope:'server'});
var pre = new Precompiler({
  compress:false,
  src:['./__clnt.js'],
  dst:'./_wilds/_scripts.min.js',
  srcCSS:'./_wilds/_default.styl',
  dstCSS:'./_wilds/_styles.css'
});

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
brico.Stream.on('connection', function (conn) {
  console.dir(conn);
  conn.on('data', function(data) {
    console.dir(data);
  });
});
sock.install(server, '/bus');

// remove this! -- handle session in brico!
// sock.on('connection', function(conn) { // trigger create streams func in brico
//   console.dir(conn);
//   var x = brico.Stream.createStream('brico');
  // session = conn.id;
  // console.dir(session);
  // for(var i=0;i<map.clientMap.length;i++) {
  //   var mod = map.clientMap[i];
  //   if(mod.id==='console') {
  //     x.write(['AddMod',mod]);
  //   }
  // }
// });
