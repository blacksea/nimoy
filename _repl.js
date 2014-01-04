// REPL

var clc = require('cli-color')
var read = require('read')

function REPL (msg) {
  if (msg) console.log(clc.xterm(clr.b)(msg))
  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        nimoy[c[0]](c[1],REPL)
      } else {
        nimoy[c](REPL)
      }
    }
  })
}

var colors = [
  {f:0,b:11},
  {f:0,b:14},
  {f:0,b:15}
]

var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]

REPL(clc.xterm(clr.f).bgXterm(clr.b)(' nimoy:0.0.1'))

module.exports = REPL
