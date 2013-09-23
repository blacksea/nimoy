var fern = require('./index.js')
var Readable = require('stream').Readable

var rs = new Readable
rs._read = function () { 
  setInterval(function () {
    rs.push(JSON.stringify(['xTwo',Math.random()]))
  }, 10)
}

var tree = {
  xTwo : function (input,output) {
    output(input*2)
  },
  xFour : function (input,output) {
    output(input*4)
  }
}

var f = new fern({tree:tree})

rs.pipe(f).pipe(process.stdout)
