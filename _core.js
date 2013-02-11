// C O R E  server

var http = require('http')
, Router = require('./_route')
, surv = require('./_surv')
, bricoleur = require('./_brico')
, provision = require('./_prov')
, shoe = require('shoe');

var router = Router({"/":"./_wilds/frame.html","/bundle.min.js":"./_wilds/bundle.min.js"});
var server = http.createServer(router);  // router should be configurable
server.listen(8888);

// replace all manual settings with settings from config - read by survey
provision({
  in : ['_wilds/cores.js'],
  out : '_wilds/bundle.min.js',
  compress : true
}); // compile client side....

var brico = new bricoleur();
var survey = new surv({dir:'./'});

survey.scan(function(json){
  // also compile / prep for client side
  brico.init(json);
  provision(['_wilds/core.js'],'_wilds/public/bundle.min.js'); // compile client side....
});

var sock = shoe(function(stream){
  stream.pipe(brico.stream).pipe(stream);
});
sock.install(server, '/bus');
sock.on('connection', function(conn) { 
  // trigger create streams func in brico
});
