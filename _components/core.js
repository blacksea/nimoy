// C O R E  client

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');
var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);

var s = brico.stream.createStream('y');
setInterval(function(){
  s.write('44');
}, 500);
brico.stream.on('connection', function (stream) {
  console.log(stream);
  stream.on('data', function (data) {
    console.log(stream.meta+' '+data);
  });
});
