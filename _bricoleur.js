var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through2')
var utils = require('utils')


module.exports = function Bricoleur (db, user, config) { // >>>>>>>>>>>>>>>>>>>

  localStorage.library = JSON.stringify(config.library)

  if (config.rendering) var render = require(config.rendering)

  var s = through.obj(function interface (d, enc, next) {
    if (!d.key) { next(); return false }

    var path = d.key.split(':')[0]

    if (path === 'put' ) {
      if (typeof d.value === 'string') {
        d.type = (!d.value.match('>')) ? 'module' : 'pipe'
        api.put(d)
      } else if (d.value instanceof Array) 
        d.value.forEach(function (item) {
          var cmd = {}
          cmd.type = (!item.match('>')) ? 'module' : 'pipe'
          cmd.value = (cmd.type==='pipe') ? item.split('>') : item
          api.put(cmd)
        })
    } else if (api[path]) {
      api[path](d, handleOutput)
    }

    function handleOutput (e, res) {
      if (e) handleError(e)
      if (res) {
        if (res.to) { res.from = id; s.push(res) }
      }
    }

    next() // this should likely happen in handleOutput
  })

  db.liveStream({reverse : true})
    .on('data', sync)

  function sync (d) { 
    var path = d.key.split(':')[0]
  }

  // BRICOLEUR API >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  var id = utils.UID('brico')
  var canvas = { index : {} }
  canvas.index[id+':brico'] = {id : id}
  canvas[id] = s

  window.cvs = canvas

  var api = {}

  api.get = function (d, cb) {
    db.get(d.value, function returnResult (e, res) {
      if (e) cb(e, null)
      if (!e) {
        var result = (d.from) ? {to:d.from, value:res} : {value:res}
        cb(null, result)
      }
    })
  }

  api.data = function (d, cb) {
    db.put(d.value.key, d.value.data, cb)
  }

  api.put = function (d, cb) { 
    if (d.type === 'pipe') {
      var conn = d.value

      var a = canvas[utils.search(canvas.index, conn[0]).id]
      var b = canvas[utils.search(canvas.index, conn[1]).id]

      var hash = utils.UID(conn)

      if (!a.pipe || !b.pipe) cb(new Error('unpipeable!'), null)

      a.pipe(b)
      
      canvas.index[hash+':'+conn[0]+'|'+conn[1]] = [a.id, b.id] // call db 

      var res = (!d.from) ? {code: 200} : {code:200, to: d.from}

      if (cb) cb(null, res)

    } else if (d.type === 'module') {
      var nameOrPkg = d.value

      var pkg = (typeof nameOrPkg !== 'object') // mod
        ? utils.search(config.library.master, nameOrPkg) 
        : nameOrPkg

      if (!pkg) handleError(e)

      var hash = utils.UID(pkg.name)
      pkg.id = hash
      var key = 'module:' + hash + ':' + pkg.name
      canvas[hash] = render(pkg, hash)
      canvas.index[hash+':'+pkg.name] = pkg 

      if (pkg.nimoy.data)
        db.put({key:'module:'+hash, value: pkg.data})

      var res = (!d.from) ? {code: 200} : {code:200, to: d.from}
      if (cb) cb(null, res)
    }
  }

  api.del = function (d, cb) {
    if (d.type === 'pipe') { // parse input
      var conn = d.value
      var a = canvas[conn][0] 
      var b = canvas[conn][1]
      a.unpipe(b) 
      delete canvas.index[hash]
    } else if (d.type === 'module') { // mod
      var mod = search(canvas, hash)
      if (mod) { 
        document.body.removeChild(document.getElementById(hash))
        delete mod 
      }
      delete canvas.index[hash]
    }
  }

  api.auth = function (d, cb) {
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
        if (!document.querySelector('.login')) document.body.appendChild(login)
        handleError(e)
      } else if (!e) {
        sessionStorage[res.name] = res.token
        if (document.querySelector('.login')) document.body.removeChild(login)
        s.write({
          key:'put', 
          value: [config.editor,config.editor+'>brico','brico>'+config.editor]
        })
        // load page!
        return false
      }
    }
  } 

  api.deauth = function (d, cb) {
    db.deauth(function () {
      // remove editor!
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
    })
  } 
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  // login ui >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  login = document.createElement('div')
  login.className = 'login'
  login.innerHTML = '<form id="loginForm">'
    + '<input type="password" placeholder="enter password" />'
    + '<input type="submit" value="edit" style="display:none;" />'
    + '</form>'

  login.querySelector('#loginForm')
    .addEventListener('submit', api.auth, false)
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    

  // boot >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  if (sessionStorage[user])
    api.auth({ name : user, session : sessionStorage[user] })

  if (!sessionStorage[user] && user !== 'default') {
    document.body.appendChild(login)
  }
  // end boot <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


  return s

} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function handleError (e) {
  console.error(e)
}
