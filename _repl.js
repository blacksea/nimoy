// REPL : pipes into leveldb writeStream


var through = require('through')
var clc = require('cli-color')
var read = require('read') 
var log = clc.cyanBright

module.exports = function (db) {

  var s = through(function write (buf) {
    var self = this
    var args = buf.toString().split(' ')
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
        if (e) self.emit('error', e)
        if (!e && res) self.emit('data', res)
      })
    } else if (!args[2]) db[d.type](d.key, function (e, res) {
      if (e) self.emit('error', e)
      if (!e && res) self.emit('data', res)
    })
  }, function end () {
    this.emit('end')
  })

  return s
}
