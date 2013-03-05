// CLIENT

Object._ = function(){} // create a global scope for modules

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

var brico = new bricoleur();
bus.pipe(brico.stream).pipe(bus);
