// CLIENT

Object._ = function(){} 

var shoe = require('shoe')
, MuxDemux = require('mux-demux')
, bricoleur = require('./_brico')
, connID = null;

var brico = new bricoleur({scope:'client'});

var bus = shoe('/bus');

bus.on('connect', function () {
  connID = new Date().getTime(); 
  bus.write(JSON.stringify({tmpID:connID}));
});

bus.on('data', function (data) {
  var obj = JSON.parse(data);
  if (typeof obj === 'object') {
    console.dir(data);
  }
  if (obj[connID]) {
    connID = obj[connID];
    console.dir('bind to '+connID);
  }
});
