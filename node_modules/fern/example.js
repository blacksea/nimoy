var fern = require('./index.js')
var Readable = require('stream').Readable

var rs = new Readable
rs._read = function () { 
  setInterval(function () {
    var json = {f:['xTwo',Math.random()]}
    rs.push(JSON.stringify(json))
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

var f = new fern({key:'f',tree:tree})

rs.pipe(f).pipe(process.stdout)
