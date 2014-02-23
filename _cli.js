// CLI 


var through = require('through')
var clc = require('cli-color')
var err = clc.redBright
var log = clc.cyanBright
var prefix = log('nimoy: ')


module.exports = function () {

  function makeOpts (inlineOpts) {
    var opts = {}
    for (var i=0;i<inlineOpts.length;i++) {
      var key = inlineOpts[i].split(':')[0]
      var val = inlineOpts[i].split(':')[1]
      opts[key] = val
    }
    return opts
  }

  var s = through(function write (buf) { // plaintext stream
    var self = this
    var d = {}
    var badOpts
    var args 
    var cmd

    // check for string input
    if (buf instanceof Buffer || typeof buf === 'string') {
      if (buf instanceof Buffer) cmd = buf.toString()
      if (typeof buf === 'string') cmd = buf
      args = cmd.replace('\n','').split(' ') 
      d.type = args[0]
      if (args[1]) {
        var inlineOpts = args[1].split(',')
        for (var i=0;i<inlineOpts.length;i++) {
          var sep = inlineOpts[i].match(':')
          if (sep === null) badOpts = true
        }
        if (badOpts === true) {
          self.emit('error', new Error('Cli: Opts arg "'+args[1]+'" missing colon/s\n should be in format: "a:one,b:two"'))
        } else if (!badOpts) {
          d.opts = makeOpts(inlineOpts)
          self.emit('data', d)
        }
      }
    } else {
      self.emit('error', new Error('Cli: Input should be string'))
    }
  }, function end () {
    this.emit('end')
  })

  return s
}
