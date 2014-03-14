var fern = require('fern')

module.exports = function (db, opts) {
 
  var api = fern({

    put: function (d, emit) {
      var key
      var value

      db.put(key, value, handleResult)
    },

    del: function (d, emit) {
      var key

      db.del(key, handleResult)
    },

    pipe: function (d, emit) {
      var key
      var value

      db.put(key, value, handleResult)
    },

    unpipe: function (d, emit) {
      var key
      
      db.del(key, handleResult)
    },

    ls: function (d, emit) {

      db.get(key, function (e, d) {

      })
    },

    search : function (d, emit) {

      db.get(key, function (e, d) {

      })
    }

  })

  function handleResult (e, res) {
    if (e) api.emit('error', e)
    if (!e) api.emit('data', res)
  }

  return api
}
