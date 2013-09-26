var fern = require('./index.js')
var through = require('through')

var s = through(function write (chunk) {
  this.emit('data', chunk)
}, function end () {
  this.emit('end')
})

var tree = {
  xTwo : function (input,output) {
    output(input*2)
  },
  xFour : function (input,output) {
    output(input*4)
  }
}

var f = new fern({tree:tree})

s.pipe(f).pipe(process.stdout)
s.write(['xTwo',Math.random()])
