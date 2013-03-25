// SERVER

Object._ = function(){} // module scope : this is proably a bad idea

var Bricoleur = require('./_brico')
, Precompiler = require('./_pre')
, MuxDemux = require('mux-demux')
, Mapper = require('./_map')
, Router = require('./_rtr')
, User = require('./_usr')
, http = require('http')
, stream = require('stream')
, shoe = require('shoe');

var brico = new Bricoleur({scope:'server'});

// make a brico for each user & map host to that brico

var pre = new Precompiler({
  compress:false,
  src:['./__clnt.js'],
  dst:'./_wilds/_bundle.min.js',
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

var sock = shoe({log:'error'}, function (stream) { // or specify function
  stream.on('data', function (data) {
    var obj = JSON.parse(data);
    for (key in obj) {
      if (key==='tmpID') {
        var setID = {}
        setID[obj[key]] = stream.id;
        console.dir('bind to '+stream.id);
        stream.write(JSON.stringify(setID));
      }
    }
  });
});

sock.install(server, '/bus');

