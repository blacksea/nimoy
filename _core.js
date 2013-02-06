/* C O R E 
	app setup
*/

var shell = require('./_shell')
, brico = require('./_brico')
, shoe = require('shoe')
, muxDemux = require('mux-demux')
, connect = require('connect')
, http = require('http')

var iron = new shell;
var bricolo = new brico('./_components');

var app = connect()
.use(connect.logger('dev'))
.use(connect.compress())
.use(connect.static('public'))
, server = require('http').createServer(app);

server.listen(8888);
