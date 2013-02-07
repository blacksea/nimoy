// C O R E 
var shoe = require('shoe')
, MuxDemux = require('mux-demux')
, bus = shoe('bus');

var muxdemux = MuxDemux();

muxdemux.pipe(bus).pipe(muxdemux);

muxdemux.on('connection', function (stream) {
	stream.on('data', function (data) {
		var channel =  stream.meta;
	});
	// var output = mx.createStream('dx');
});

// var sock = shoe(iron.Stream);
// sock.on('connection', iron.Conn); // create streams now
// sock.install(server, '/bus');
