// C O R E  server
var http = require('http')
, User = require('./_user')
, Router = require('./_route')
, Surveyor = require('./_surv')
, Bricoleur = require('./_brico')
, Provisioner = require('./_prov')
, shoe = require('shoe');

var usr = new User(); // user hack :(
var router = new Router(usr.def.routes);
var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var brico = new Bricoleur();
var surv = new Surveyor('./_wilds');

surv.scan(function () { 
  var prov = new Provisioner({ 
    src : surv.client_files,
    dst : './_wilds/bundle.min.js',
    compress : true
  }, function (msg) {
    console.log(msg);
  }); 
  brico.init(surv.map_server);
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { // trigger create streams func in brico
  var x = brico.stream.createStream('brico');
  x.write(['init',surv.map_client]);
});
