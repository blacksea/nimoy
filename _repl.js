// REPL : pipes into leveldb writeStream

var read = require('read') 
var clc = require('cli-color')
var log = clc.cyanBright

module.exports = function repl () {
  read(opts, function (e, cmd, empty) {
    if (e && e.message == 'canceled') process.exit(0)

    if (!e && cmd) {
      var args = cmd.split(' ')
      var d = {
        type: args[0],
        key: args[1]
      }

      if (args[3]) {
        var val = {}
        var pairs = args[3].split(',')
        for (var i=0;i<pairs.length;i++) {
          var pair = pairs[i].split(':')
          val[pair[0]] = pair[1]
        }
        d.value = JSON.stringify(val)
        db[d.type](d.key,d.value)
      }

      if (!args[3]) db[d.type](d.key, function (e, d) {
        if (e) console.error(e)
        if (!e) repl(prompt) // should be able to prompt with feedback/cb
        if (!e && d) repl({prompt: d})
      })
    }
  })
}
