// BRICO

var fern = require('fern')

var brico = {
  test: function (msg,cb) {
    console.log(msg)
    if (process.browser) window.document.title = msg
    cb(msg)
  },
  loadEnv: function (user,cb) {
  },
  map: function (map, cb) {
    MAP = map
    cb('loaded map')
  },
  make: function (mod,cb) {
    var libName = mod.id.toUpperCase()
    var lib = require(libName)
    _[mod.id] = new lib() 
    if (process.browser && mod.html) _[mod.id].render(html)
  },
  unmake: function (mod,cb) {
    _[mod.id].destroy()
  },
  conn: function (conss,cb) {      
    conns.forEach(function handleConnection (conn) {
      if (conn.match(/\+/) !== null) { var modA = conn.split('+')[0] , modB = conn.split('+')[1]
        _[modA].pipe(_[modB])
      }
      if (conn.match(/\-/) !== null) {
        var modA = conn.split('-')[0]
        , modB = conn.split('-')[1]
        modA.unpipe(modB)
      }
    })
  }
}

bricoleur = new fern({key:'api',tree:brico})

module.exports = bricoleur
