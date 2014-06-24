var through = require('through')
var hmac = require('crypto-browserify/create-hmac')
var api = {}
var home
var user
var conf 
var cvs
var db


module.exports = function Bricoleur (multiLevel, usr) {
  user = usr
  db = multiLevel
  
  var interface = through(function Write (d) {
    if (!d.key || typeof d.key !== 'string') return // ignore if !key property
    var path = d.key.split(':')
    if (api[path[0]]) {
      if (d.type) api[path[0]][d.type](d)
      if (!d.type) api[path[0]](d)
    }
  })

  cvs = new Canvas(interface) 

  multiLevel.liveStream({reverse : true})
    .pipe(interface)

  return interface
}


api.auth = { // API
  put : function (d) { // fix sessions!
    var hash = (d.value.origin) 
      ? hmac('sha256',conf.secretKey).update(d.value.pass).digest('hex')
      : d.value.pass

    db.auth({ user:d.value.user, pass:hash }, function (e, res) {
      if (e) { console.error(e); return false }
      sessionStorage[res.name] = hash
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
  put : function (d) { // look at d.value and determine what to do
    // pass in args for drawing template
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

api.config = function (d) {
  conf = JSON.parse(d.value)
  console.log(conf)
  var rlib = conf.library.root
  var glib = conf.library.global

  cvs._.render = require(conf.canvasRender) // set render!
  
  if (!sessionStorage[user] && user !== 'default') {
    cvs.draw({key: 'module:'+genUID(), value: search(rlib,conf.auth)})
    cvs.draw({key:'pipe:'+genUID(), value: conf.auth+'>brico'})
  } else { 
    api.auth.put({value: {user: user, pass: sessionStorage[user]}})
  }

  localStorage.library = JSON.stringify(glib)
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
