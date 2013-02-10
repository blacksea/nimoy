// C O R E  client

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);

