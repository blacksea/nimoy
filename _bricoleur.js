var _ = require('underscore')
var cuid = require('cuid')
var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through2')


module.exports = function Bricoleur (db, user, config) { // >>>>>>>>>>>>>>>>>>>

  var s = through.obj(function interface (d, enc, next) {
    if (!d.key) { next(); return null }

    var path = d.key.split(':')[0]
    var command = d.key.split(':')[0]

    // select command
    // call!
    // send result

    if (typeof d.value === 'string')
      _.find(commands, function (fn,cmd) {if (cmd===command) return fn})(val)

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
    // check running modules & reload
    // update any static things
  }

  db.liveStream({reverse : true})
    .on('data', levelDBsync)


  // BRICOLEUR API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  function saveCanvas (str, cb) {
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

  function openCanvas (e, jsonIdx) {
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

  function putModule () {
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

    function put (e, data) {
      if (e) handleError(e)
      if (data) pkg.nimoy.data = JSON.parse(data)
      pkg.id = hash
      canvas[hash] = render(pkg, hash)
      canvas.index[hash+':'+pkg.name] = pkg 
      var res = (!d.from) ? {code : 200} : {code : 200, to : d.from}
      if (cb) cb(null, res)
    }

    if (hash) db.get('module:'+hash, put)  

    if (!hash) {
      hash = cuid()
      if (pkg.nimoy.data) {
        var val = JSON.stringify(pkg.nimoy.data)
        db.put('module:'+hash, val, put)
      } else put()
    }
  }

  function pipe () {
    var conn = d.value
    var a = canvas[utils.search(canvas.index, conn[0]).id]
    var b = canvas[utils.search(canvas.index, conn[1]).id]

    var hash = cuid()
    if (!a.pipe || !b.pipe) cb(new Error('unpipeable!'), null)

    a.pipe(b)
    
    canvas.index[hash+':'+conn[0]+'|'+conn[1]] = [a.id, b.id] // call db 

    var res = (!d.from) ? { code : 200 } : { code : 200, to : d.from }

    if (cb) cb(null, res)
  }

  function unpipe () {
    if (d.type === 'pipe') { // parse input
    var conn = d.value
    var a = canvas[conn][0] 
    var b = canvas[conn][1]
    a.unpipe(b) 
    delete canvas.index[hash]
  }

  function rmModule () {
    var mod = search(canvas, hash)
    if (mod) { 
      document.body.removeChild(document.getElementById(hash))
      delete mod 
    }
    delete canvas.index[hash]
  }

  function auth (d, cb) {
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

  var commands = {
    'put' : function (items) {
      if (items instanceof Array) {
      } else if (items instanceof 'string') {
      }
    }, 
    'rm' : function () {
    }
  } // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  // login ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  login = document.createElement('div')
  login.className = 'login'
  login.innerHTML = '<form id="loginForm">'
    + '<input type="password" placeholder="enter password" />'
    + '<input type="submit" value="edit" style="display:none;" />'
    + '</form>'

  login.querySelector('#loginForm')
    .addEventListener('submit', commands.auth, false)
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  // boot >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  if (sessionStorage[user])
    commands.auth({ name : user, session : sessionStorage[user] })

  if (!sessionStorage[user] && user !== 'default') {
    document.body.appendChild(login)
    login.querySelector('input').focus()
  }
  // end boot <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  return s
} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function handleError (e) {
  console.error(e)
}
