// C O R E  client
var shoe = require('shoe')
, shell = require('../_shell')
, bus = shoe('bus');
var waffle = new shell;
bus.pipe(waffle.Stream).pipe(bus);
