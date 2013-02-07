// C O R E
var shell = require('./_shell')
, brico = require('./_brico')
, http = require('http')
, browserify = require('browserify')
, shoe = require('shoe')
, fs = require('fs')
, filed = require('filed')
, uglifyJS = require('uglify-js');
var iron = new shell;

//////////////////////////////////////////////////////////
var bundle = browserify('./_components/core.js').bundle();
var bundleMin = uglifyJS.minify(bundle, {fromString:true});
fs.writeFile('./_components/public/bundle.min.js', bundleMin.code, function(err) {
    if (err) console.log(err);
});
////////////////////////////////////////////////////
var server = http.createServer(function (req, res) { // pass in a module/function instead
    console.log(req.url);
    if(req.url==='/bundle.min.js'){
        filed('_components/public/bundle.min.js').pipe(res);
    }
    else if (req.url==='/'){
        filed('_components/public/frame.html').pipe(res);
    }
    else {
        res.end('fuuuuuuk');
    }
});
server.listen(8888);
/////////////////////////////////////////////////////////////

var sock = shoe(iron.Stream);
sock.on('connection', iron.Conn); // create streams now
sock.install(server, '/bus');
