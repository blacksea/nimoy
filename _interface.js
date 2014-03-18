module.exports = require('through')(function Transform (d) {

  var self = this

  var uid = new Date().getTime()


  var index = [
    ['put', '*', 'put'],
    ['del', '*', 'del'],
    ['/\|/', '#', 'put'],
    ['-', '#', 'del'],
    ['ls', '+', 'put'],
    ['search', '^', 'put']
  ]


  if (d instanceof Buffer) {
    formatFromString(d.toString().replace('\n','')) 
  } else if (typeof d === 'string' && d[0] === '{') {
    formatFromJson(d)
  } else noFormat(d)

      
  function formatFromString (s) {

    var c = s.split(' ')
    var cmd = {}

    index.forEach(function convert (idx) {
      if (c[0].match(idx[0]) !== null) {
        cmd.key = idx[1]
        if (c[1]) cmd.key += ( ':' + c[1] )
        if (c[2]) cmd.value = c[2]
        if (idx[2] === 'put' && !c[2]) cmd.value = JSON.stringify({uid:uid})
        cmd.key += (':' + uid)
        cmd.type = idx[2]
      }
    })

    self.emit('data', cmd)

  }


  function formatFromJson (j) {

    // self.emit('data', cmd)

  }


  function noFormat (d) {
    
    self.emit('error', new Error('unrecognized command'))

  }


}, function End () {

  this.emit('end')
  
})
