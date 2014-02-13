var test = require('tape')
var level = require('level')
var liveStream = require('level-live-stream')
var db = level('testDB')
liveStream.install(db)

var bricoleur = require('../_brico.js')
var brico = new bricoleur(db)

brico.on('error', function (e) {

})
