// CLIENT

Object._ = function(){} // create a global scope for modules

var shoe = require('shoe')
, bus = shoe('bus')
, bricoleur = require('../_brico');

var brico = new bricoleur({scope:'client'});
bus.pipe(brico.Stream).pipe(bus);
