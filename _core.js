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

survey.scan(function(map){ 
  var prov = new Provisioner({ 
    src : survey.client_files,
    dst : './_wilds/bundle.min.js',
    compress : true
  }, function (msg) {
    console.log(msg);
  }); 
  brico.init();
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { // trigger create streams func in brico
  // add streams to mux-demux
});
