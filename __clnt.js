// CLIENT

Object._ = function(){} // create a global scope for modules

var shoe = require('shoe')
, MuxDemux = require('mux-demux')
, bricoleur = require('./_brico');

var brico = new bricoleur({scope:'client'});

var bus = shoe('/bus');

var connID = null;

bus.on('connect', function () {
  connID = new Date().getTime(); // gen temp id
  bus.write(JSON.stringify({tmpID:connID}));
});

bus.on('data', function (data) {
  var obj = JSON.parse(data);
  if (obj[connID]) {
    connID = obj[connID];
    console.dir('bind to '+connID);
  }
});

