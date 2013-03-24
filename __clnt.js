// CLIENT

Object._ = function(){} // create a global scope for modules

var shoe = require('shoe')
, bricoleur = require('./_brico');

var brico = new bricoleur({scope:'client'});

var bus = shoe('/bus');

bus.on('connect', function () {
  console.log('connected');
  bus.write('data');
});

bus.on('data', function (data) {
  // server will send id 
  console.dir(data);
});

