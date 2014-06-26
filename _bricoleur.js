var config = require('./bricoleurConfig.json')
var hmac = require('crypto-browserify/create-hmac')
var Buffer = require('buffer/').Buffer
var through = require('through')


function boot (conf) {
  var rlib = conf.library.root
  var glib = conf.library.global
  localStorage.library = JSON.stringify(glib) 

  cvs._.render = require(conf.canvasRender) // set render!
  
  if (!sessionStorage[user] && user !== 'default') {
    cvs.draw({
      key: 'module:'+genUID(), 
      value: search(conf.library.root, conf.auth)
    })
    cvs.draw({key:'pipe:'+genUID(), value: conf.auth + '>brico'})
  } else {
    api.auth.put({value: {name: user, session: sessionStorage[user]}})
  }
}


var interface = function (db, cvs, cb) { // API
  self = this

  boot(config)

  db.livestream({reverse : true})
    .on('data', sync)

  function sync (d) {
    var path = d.key.split(':')

  }

  var s = through(function Write (d) {

    // provide ways to call api in streaming fashion
    
    console.log(d)

  })

  this.deauth = function (d) {

  }
  this.auth = function (d) {

  }

  // auth !

  // sessions !

  // data !

  // canvas !

  cb(s)
}

var Canvas = function (interface) { // to save stringify cvs._ to db
  var self = this

  this._ = { brico : { s : interface } }

  this.draw = function (d) { 
    if (!d.key) { console.error('CANVAS: bad input', d); return false }

    var path = d.key.split(':')

    if (path[0] === 'pipe') {
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      self._[d.key] = d.value
      a.s.pipe(b.s)
    } else if (path[0] === 'module') {
      d.key += ':' + d.value.name
      self._[d.key] = self._.render(d) // consistent stream protocol
    }
  } 

  this.erase = function (d) {
    if (!d.key) { console.error('CANVAS: bad input', d); return false }

    var path = d.key.split(':')

    if (path[0] === 'pipe') {
      var conn = d.value.split('>')
      var a = search(self._, conn[0])
      var b = search(self._, conn[1])
      a.unpipe(b)
      delete self._[d.key]
    } else if (path[0] === 'module') {
      self._[d.key].erase()
      delete self._[d.key]
    }
  }
}

module.exports = function Bricoleur (multiLevel, usr) {
  var cvs = new Canvas(interface) 
  var api = new interface(multiLevel, cvs, function (s) {
    return s
  })
}


api.auth = {
  put : function (d) {
    var img = new Buffer(conf.uImg).toString()

    var auth = { name: d.value.name }

    if (!d.value.session)
      auth.pass = hmac('sha256', img).update(d.value.pass).digest('hex')

    if (d.value.session) auth.session = d.value.session

    db.auth(auth, function (e, res) {
      if (e) { 
        console.error(e)
        if (!search(cvs._, conf.auth)) {
          cvs.draw({
            key: 'module:'+genUID(), 
            value: search(conf.library.root, conf.auth)
          })
          cvs.draw({key:'pipe:'+genUID(), value: conf.auth + '>brico'})
        } else console.error(e) // draw login interface!
        return false
      }
      sessionStorage[res.name] = res.token
      if (conf.users[user].canvas) api.canvas.put(conf.users[user].canvas)
      if (d.value.origin) cvs._[d.value.origin].s.write(res)
    })
  }, 
  del : function (d) {
    db.deauth(function () { 
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
      window.location = path
    })
  }
}

api.data = { // fix this to prevent a feedback loop!
  put : function (d) { 
    db.put(d.key, d.value, function (e) { if (e) console.error(e) }) 
  },
  del : function (d) { db.del(d.key) },
  get : function (d) { 
    db.get(d.key, function (e, res) { 
      if (e) { console.error(e); return false }
      cvs._[d.key.replace('data','module')].write(res)
    })
  }
}

api.canvas = { // micro macro !?! -- just modifies canvas!
  put : function (d) { 
    var objects = []
    if (d.modules) {
      d.modules.map(function (currentValue, index, array) {
        var pkg = search(conf.library.root, currentValue) 
        objects.push({key:'module:'+genUID(), value: pkg})
      })
      objects.forEach(cvs.draw)
    }
    if (d.pipes) {
      objects = []
      d.pipes.forEach(function (p) {
        objects.push({key:'pipe:'+genUID(), value:p})
      })
      objects.forEach(cvs.draw)
    }
  },
  del : function (d) {

  }
}

// UTILS

function genUID () {
  return Math.random().toString().slice(2) 
} 

function search (haystack, needle) {
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}

function getPath () {
  if (!window.location.hash) return false
  if (window.location.hash) return window.location.hash.slice(1)
}

window.Buffer = Buffer
