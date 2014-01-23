var fs = require('fs')
var map = require('../_map')
var test = require('tape')

var dir = '../_wilds/'
var mods

fs.readdir(dir, function (e,m) {
  if(e)console.error(e)
  if(!e)mods = m
})

test('map test', function (t) {
  map(dir, function (m) {
    t.equal((typeof m),'object','typeof map is object')
    t.end()
  })
})
