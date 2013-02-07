var shoe = require('shoe')
, MuxDemux = require('mux-demux')
, s = shoe('bus');

var mx = MuxDemux();

mx.pipe(s).pipe(mx);

mx.on('connection', function (stream) {
	stream.on('data', function (data) {
		console.log(data);
		console.log(stream.meta);
	});
	var p = mx.createStream('dx');
	setInterval(function() {
		p.write('nordove');
	}, 50); 
});


