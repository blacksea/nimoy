module.exports = function REPL (msg) {
  var clc = require('cli-color')
  var read = require('read')

  var colors = [{f:0,b:11},{f:0,b:14},{f:0,b:15}]
  var clr = colors[Math.floor(Math.random() * ((colors.length-1) - 0 + 1) + 0)]

  if (msg) console.log(clc.xterm(clr.b)(msg))

  read({}, function handleInput (e,c,d) {
    if (e) console.error(e)
    if (!e) {
      var args = c.match(' ')
      if (args !== null) { 
        c = c.split(' ')
        s.write(c)
        REPL()
      } else {
        s.write(c)
        REPL()
      }
    }
  })

  var s = through(function write (d) {
    this.emit('data',d) 
  }, function end () {
    this.emit('end')
  })

  return s
}
