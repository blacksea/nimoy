var hmac = require('crypto-browserify/create-hmac')
var config = require('./bricoleurConfig.json')
var Buffer = require('buffer/').Buffer
var through = require('through')


var interface = function (db, cvs, user, cb) { 
  self = this

  cvs._.render = require(config.canvasRender) 
  var login = search(config.library.root, config.auth)

  if (sessionStorage[user])
    self.auth({value: {name: user, session: sessionStorage[user]}})

  if (!sessionStorage[user] && user !== 'default')
    cvs.draw({key:'pipe:'+genUID(), value: config.auth + '>brico'})

  cvs.draw([login,'login>brico'])

  db.livestream({reverse : true})
    .on('data', sync)

  function sync (d) { // sync up with db / push updates
    var path = d.key.split(':')
    if (path[0] === 'library') { // install library in this function!

    }
  }

  var s = through(function Write (d) { // multiple ways to call api
    console.log(d)
  })

  this.auth = function (d) {
    var img = new Buffer(config.uImg).toString()

    var auth = { name: d.value.name }
    if (!d.value.session)
      auth.pass = hmac('sha256', img).update(d.value.pass).digest('hex')

    if (d.value.session) auth.session = d.value.session

    db.auth(auth, function (e, res) {
      if (e) { 
        if (!search(cvs._, config.auth)) {
          cvs.draw({
            key: 'module:'+genUID(), 
            value: search(config.library.root, config.auth)
          })
          cvs.draw({key:'pipe:'+genUID(), value: config.auth + '>brico'})
        } else console.error(e) // draw login interface!
        return false
      }
      sessionStorage[res.name] = res.token
      if (config.users[user].canvas) api.canvas.put(config.users[user].canvas)
      if (d.value.origin) cvs._[d.value.origin].s.write(res)
    })
  }

  this.deauth = function (d) {
    db.deauth(function () { 
      delete sessionStorage[user] 
      var path = (!getPath()) ? home : home + getPath()
      window.location = path
    })
  }

  this.canvas = function (d) {
    var objects = []
    if (d.modules) {
      d.modules.map(function (currentValue, index, array) {
        var pkg = search(config.library.root, currentValue) 
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
  }

  this.data = function (d) {

  }

  cb(s)
}

var Canvas = function (interface) {
  var self = this

  this._ = { brico : { s : interface } }

  this.draw = function (d) { 
    if (typeof d === 'string') { 
      if (d.split('>').length > 0) { 
        drawPipe(d.split('>'))
      } else drawModule(d)
    }
    if (typeof d === 'object' && d.nimoy) drawModule(d)
    if (d instanceof Array) { // sync draw
      d.forEach(function (str) {
        if (typeof str === 'string' && str.split('>').length > 0) {
          drawPipe(str.split('>'))
        } else drawModule(d)
      })
    } 

    function drawPipe (conn) {
      var a = search(self._, conn[0]).s
      var b = search(self._, conn[1]).s
      var key = 'pipe:' + conn + ':' + genUID()
      a.pipe(b)
      self._[key] = [a , b]
    }

    function drawModule (nameOrPkg) {
      var pkg = (typeof nameOrPkg !== 'object') 
        ? search(config.library.master, nameOrPkg)
        : nameOrPkg
      
      var key = 'module:' + pkg.name + ':' + genUID()
      self._[key] = self._.render(pkg)
    }
  } 

  this.erase = function (d) {
    if (typeof d === 'string') { 
      if (d.split('>').length > 0) { 
        drawPipe(d.split('>'))
      } else drawModule(d)
    }
    if (typeof d === 'object' && d.nimoy) drawModule(d)
    if (d instanceof Array) { // sync draw
      d.forEach(function (str) {
        if (typeof str === 'string' && str.split('>').length > 0) {
          drawPipe(str.split('>'))
        } else drawModule(d)
      })
    } 

    function erasePipe (pipeID) {
      var a = self._[pipeID][0] 
      var b = self._[pipeID][1]
      a.unpipe(b)
      delete self._[pipeID]
    }

    function eraseModule (moduleID) {
      // check for pipes first then delete

      delete self._[mod]
     
      var key = 'module:' + pkg.name + ':' + genUID()
      self._[key] = self._.render(pkg)
    }
  }
}

module.exports = function Bricoleur (multiLevel, usr) {
  var cvs = new Canvas(interface) 
  var api = new interface(multiLevel, cvs, usr, function (s) {
    return s
  })
  window.cvs = cvs._
}

// UTILS
function genUID () { return Math.random().toString().slice(2) } 

function search (haystack, needle) {
  for (hay in haystack) {
    if (hay.match(needle)) return haystack[hay]
  }
}

function getPath () {
  if (!window.location.hash) return false
  if (window.location.hash) return window.location.hash.slice(1)
}

