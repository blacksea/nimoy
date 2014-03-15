module.exports = through(function Transform (d) {

  var self = this

  var uid = new Date().getTime()

  var index = [
    ['put', '*', 'put'],
    ['del', '*', 'del'],
    ['|', '#', 'put'],
    ['-', '#', 'del'],
    ['ls', '+', 'put'],
    ['search', '^', 'put']
  ]

  (d instanceof Buffer) 
    ? formatFromString(d.toString().replace('\n','')) : (typeof d === 'string' && d[0] === '{')
      ? formatFromJson(d) : noFormat(d)

      
  function formatFromString (s) {

    var cmd = {}

    cmds.map(function convert (index, i, a) {
      if (c[0].match(index[0]) !== null) {
        cmd.key = index[0]
        if (c[1]) cmd.key += ( ':' + c[1] )
        if (c[2]) cmd.value = c[2]
        if (index[2] === 'put' && !c[2]) cmd.value = ''
        cmd.key += uid
        cmd.type = index[2]
      }
    })

    self.emit('data', cmd)

  }


  function formatFromJson (j) {

    self.emit('data', cmd)

  }


  function noFormat (d) {
    
    self.emit('error', new Error('unrecognized command'))

  }


}, function End () {

  this.emit('end')
  
})
