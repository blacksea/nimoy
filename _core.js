// C O R E  server
var http = require('http')
, User = require('./_user')
, Router = require('./_route')
, surv = require('./_surv')
, bricoleur = require('./_brico')
, provision = require('./_prov')
, shoe = require('shoe');

var usr = new User(); // user hack :(
var router = new Router(usr.def.routes);
var server = http.createServer(router.handleRoutes); // pass all http reqs to router.handleRoutes
server.listen(8888);

var brico = new bricoleur();
var survey = new surv({dir:'./_wilds'});

survey.scan(function(map){ 
  var prov = new provision({ 
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
