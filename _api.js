var through = require('through')

module.exports = function (db, opts) {
 
  var api = through(function Write (d) {

    var cmd

    if (typeof d === 'string') cmd = d.split(' ')

    if (cmd.length === 1) {

      var pipe = cmd[0].match('|')
      var unpipe = cmd[0].match('-')

      if (pipe) {
        var key = 
        var value = cmd[0]
        db.put(key, value, handleResult)
      }

      if (unpipe) {
        var key = 
        db.del(key, handleResult)
      }

      if (!pipe && !unpipe && cmd[0] === 'ls')  {
        // create active map --- write stream of active modules
      }

    } else {

      if (cmd[0] === 'put') {
        var name = cmd[1]
        var uid = 
        var key = '*:'+name+':'+uid

        var value = (!cmd[2]) 
          ? {}
          : JSON.parse(cmd[2])

        db.put(key, value, handleResult)
      }

      if (cmd[0] === 'del') {
        var uid = cmd[1]
        db.del(uid, handleResult)
      }

      if (cmd[0] === 'search') {
        var str = cmd[1]
        search(str, function result (e, res) {
          if (e) api.emit('error', e)
          if (!e) {
            // format result
          }
        })
      }

    }

  }, function End () {

    this.emit('end')

  })


  function search (str, res) {
    var result = []

    db.createKeyStream()
      .on('data', function (key) {
        var items = key.split(':')
        items.forEach(function (item) {
          if (item === str) result.push(key)
        })
      })
      .on('close', function () {
        (result.length > 0) 
          ? res(null, result)
          : res(new Error('not found'), null)
      })

  }


  function handleResult (e, res) {
    if (e) api.emit('error', e)
    if (!e) api.emit('data', res)
  }


  return api

}
