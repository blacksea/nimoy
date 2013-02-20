// S E R V E R
var http = require('http')
, USR = require('./_usr')
, RTR = require('./_rtr')
, MAP = require('./_map')
, BRICO = require('./_brico')
, PRE = require('./_pre')
, shoe = require('shoe');

var usr = new USR(); // user hack :(
var router = new RTR(usr.def.routes);
var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var brico = new BRICO();
var map = new MAP('./_wilds');

map.scan(function () { 
  var pre = new PRE({ 
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
