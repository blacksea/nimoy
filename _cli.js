// CLI : pipes into leveldb writeStream

var through = require('through')
var clc = require('cli-color')
var err = clc.redBright
var log = clc.cyanBright

module.exports = function (opts) {

 var s = through(function write (buf) {
    var self = this
    var args = buf.toString().replace('\n','').split(' ')
    var d = {
      type: args[0],
      key: args[1]
    }
    
    if (args[2]) {
      var val = {}
      var pairs = args[2].split(',')

      for (var i=0;i<pairs.length;i++) {
        var pair = pairs[i]
        val[pair[0]] = pair[1]
      }
      d.value = JSON.stringify(val)

      db[d.type](d.key, d.value, function (e, res) {
        if (e) self.emit('data', err(e) + '\n'+log('> '))
        if (!e) 
          res ? self.emit('data', log(res + '\n> ')) : self.emit('data', log('> '))
      })
    } else if (!args[2]) 
      db[d.type](d.key, function (e, res) {
        if (e) self.emit('data', err(e) + '\n'+log('> '))
        if (!e) 
          res ? self.emit('data', log(res + '\n> ')) : self.emit('data', log('> '))
      })
  }, function end () {
    this.emit('end')
  })

  setTimeout(function () {// fix this up somehow?
    s.emit('data', log('> '))
  }, 250)

  return s
}
