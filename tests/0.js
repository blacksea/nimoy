// test brico

// run live with nimoy + cli
var map = require('../_map')
var test = require('tape')

map('../_wilds/', function (m) {
  console.log(m)
})
