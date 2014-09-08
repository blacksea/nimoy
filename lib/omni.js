var asyncMap = require('slide').asyncMap
var through = require('through2')
var _ = require('underscore')
var D = require('./dombii.js')
var drompii = require('./drompii.js')
var fs = require('fs')

var template = fs.readFileSync(__dirname+'/omni.hogan','utf8')

if (sessionStorage[user]) 
  bricoleur.write('@'+user+' '+sessionStorage[user])

// do not load core modules into canvas!

if (!sessionStorage[user]) {
  var login = require('./lib/login')
  login.pipe(bricoleur).pipe(login)
}

module.exports = function Omni (opts) {
  var id = opts.id

  var s = through.obj(function Write (d, enc, next) {
    next()
  })

  window.addEventListener('contextmenu', function (e) {
    var blob = drompii(e)
  }, false)

  return s
}

function keyMappings (e) {
  if (e.keyCode === 27) { 
    e.preventDefault()
    om.toggle() 
  } else if (e.keyCode === 40 || e.keyCode === 38 && live) {
    e.preventDefault() 
    var incdec = (e.keyCode === 38) ? 'inc' : 'dec'
    om.sel(incdec) 
  }
}

// need upload helper!
