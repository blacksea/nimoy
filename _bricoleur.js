var _ = require('underscore')
var cuid = require('cuid')
var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through2')


module.exports = function Bricoleur (db, user, config) { 
  var canvas = {}

  var s = through.obj(function interface (d, enc, next) {
    if (!d.key) { next(); return null }

    var path = d.key.split(':')[0]
    var command = d.key.split(':')[0]

    // select command
    // call!
    // send result

    if (typeof d.value === 'string')
      _.find(commands,function(fn,cmd){if (cmd === command) return fn})(val)

    if (d.value instanceof Array)
      d.value.forEach(function (item) {
        var cmd = {}
        cmd.type = (!item.match('>')) ? 'module' : 'pipe'
        cmd.value = (cmd.type === 'pipe') ? item.split('>') : item
        api.put(cmd)
      })     

    next()
  })

  function levelDBsync (d) { 

  }

  db.liveStream({reverse : true})
    .on('data', levelDBsync)

  var commands = { add:put, auth:auth, pipe:pipe } 

  function run (cmd) {
  }
 
  function saveCanvas (d, next) {
    var idx = canvas.index
    var safeIdx = {}
    for (item in idx) {
      if (!item.match(config.editor) && !item.match('brico')) {
        safeIdx[item] = item.split(':')[0]
      }
    }
    db.put('canvas:'+d.value, JSON.stringify(safeIdx), cb)
  }

  function newCanvas () {

  }

  function openCanvas (d, next) {
    if (e) { handleError(e); return null }
    var idx = JSON.parse(jsonIdx)
    for (item in canvas.index) {
      if (!item.match('brico') && !item.match(config.editor)) {
        var uid = item.split(':')[0]
        if (!idx[item]) {
          canvas[uid].erase()
          delete canvas[uid]
        }
      }
    }
    for (item in idx) {
      var hash = item.split(':')[0]
      if (!canvas[hash]) s.write({key:'put', value:item})
    }
  }

  function putModule (d, next) {
    var nameOrPkg 
    var hash

    if (d.value.split(':').length > 1) {
      hash = d.value.split(':')[0]
      nameOrPkg = d.value.split(':')[1]
    } else nameOrPkg = d.value

    var pkg = (typeof nameOrPkg !== 'object') // mod
      ? utils.search(config.library.master, nameOrPkg) 
      : nameOrPkg

    if (!pkg) handleError(new Error('no such package! '+nameOrPkg))
    if (data) pkg.nimoy.data = JSON.parse(data)

    var id = cuid()

    canvas[id] = require(m)(id)

    // get data // check for module data
    if (hash) db.get('module:'+hash, put)  

    // place module data
    db.put('module:'+hash, val, put)
  }

  function pipe (d, next) {
    var conn = d.value
    var a = canvas[utils.search(canvas.index, conn[0]).id]
    var b = canvas[utils.search(canvas.index, conn[1]).id]

    var hash = cuid()
    if (!a.pipe || !b.pipe) cb(new Error('unpipeable!'), null)

    a.pipe(b)
    
    canvas.index[hash+':'+conn[0]+'|'+conn[1]] = [a.id, b.id] 

    var res = (!d.from) ? { code : 200 } : { code : 200, to : d.from }

    if (cb) cb(null, res)
  }

  function unpipe (d, next) {
    var conn = d.value
    var a = canvas[conn][0] 
    var b = canvas[conn][1]
    a.unpipe(b) 
    delete canvas.index[hash]
  }

  function rmModule (d, next) {
    var mod = search(canvas, hash)
    if (mod) { 
      document.body.removeChild(document.getElementById(hash))
      delete mod 
    }
    delete canvas.index[hash]
  }

  function auth (d, next) { // integrate w session
    if (!d.session && d.target.id === 'loginForm') { // is dom event
      d.preventDefault()
      var img = new Buffer(config.uImg).toString()
      var pass = hmac('sha256', img).update(d.target[0].value).digest('hex')
      db.auth({name: 'edit', pass: pass}, handleAuth)
    } else if (d.session) {
      db.auth({name: d.name, session: d.session}, handleAuth)
    }

    function handleAuth (e, res) {
      if (e) {
        if (!document.querySelector('.login')) {
          document.body.appendChild(login)
          login.querySelector('input').focus()
        }
        handleError(e)
      } else if (!e) {
        sessionStorage[res.name] = res.token
        if (document.querySelector('.login')) document.body.removeChild(login)
        s.write({
          key:'put', 
          value: [config.editor,config.editor+'>brico','brico>'+config.editor]
        })
        return null
      }
    }
  } 

  return s
} 

function handleError (e) {
  console.error(e)
}
