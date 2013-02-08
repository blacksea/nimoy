// C O R E  client

var shell = require('../_shell')
, shoe = require('shoe')
, bus = shoe('bus');

var waffle = new shell;

bus.pipe(waffle.Stream).pipe(bus);
