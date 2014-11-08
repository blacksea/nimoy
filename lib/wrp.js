var through = require('through2')

module.exports = function (id) { // find a nice way to do this!
  var buf = {}
  var sync

  var s = through.obj(function (d,e,n) { 
    buf = d 
    if (sync instanceof Function)  sync(buf)
    n() 
  })

  var wrp = {
    get : function () { return buf },
    put : function (d) {
      buf = d
      s.push({type:'put', key:'$:'+id, value:JSON.stringify(buf)})
    },
    sync : function (fn) { sync = fn }, // pretty crappy
    s : s
  }

  return wrp
}
