// C O R E  server
var http = require('http')
, Router = require('./_route')
, surv = require('./_surv')
, bricoleur = require('./_brico')
, provision = require('./_prov')
, shoe = require('shoe');

var routes = [{url:"/",file:"./_wilds/frame.html"},{url:"/bundle.min.js",file:"./_wilds/bundle.min.js"}];
var router = new Router(routes);
var server = http.createServer(router.handleRoutes);
server.listen(8888);

// handle somekind of user model

var brico = new bricoleur();
var survey = new surv({dir:'./_wilds'});

survey.scan(function(json){
  // also compile / prep for client side
  brico.init(json);
  var prov = new provision({
    src : ['./_wilds/core.js'],
    dst : './_wilds/bundle.min.js',
    compress : true
  }, function (msg) {
    console.log(msg);
  }); // compile client side....
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { 
  // trigger create streams func in brico
});
