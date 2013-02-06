var shoe = require('shoe');
var es = require('event-stream');
var stream = shoe('/bus');
var s = es.mapSync(function (msg) {
		var result = document.getElementById('result');
    result.appendChild(document.createTextNode(msg));
    return String(Number(msg)^1);
});
s.pipe(stream).pipe(s);