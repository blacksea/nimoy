var asyncMap = require('slide').asyncMap
var through = require('through2')
var _ = require('underscore')
var D = require('./dombii.js')
var drompii = require('./drompii.js')
var cuid = require('cuid')
var fs = require('fs')

var tOmni = fs.readFileSync(__dirname+'/omni.hogan','utf8')
var tLogin = fs.readFileSync(__dirname+'/login.hogan','utf8')

module.exports = function Omni (opts) {
  var id = opts.id

  var login = D({ 
    template:tLogin,
    parent:document.body,
    events : [['.login','submit',submit]]
  })

  var s = through.obj(function Write (d, enc, next) {
    if (d.code===1) { // AUTH FAIL!
      next()
      console.log('FAIL',d.to,opts.id)
      login.draw()
      return false
    } else if (!d.key) { next(); return false }

    var path = d.key.split(':')
    if (path[1]===opts.id) {
      if (path[0]==='@edit') { // AUTH SUCCESS!
        sessionStorage['edit'] = d.value
        login.erase()
      }
    }
    next()
  })

  function submit (e) {
    e.preventDefault()
    s.push({cmd:'+@edit '+e.target[0].value,from:opts.id})
  }

  window.addEventListener('contextmenu', function (e) {
    var blob = drompii(e)
  }, false)
  
  if (sessionStorage['edit']) {
    s.push({cmd:'+@edit '+sessionStorage['edit'],from:opts.id})
  }

  if (!sessionStorage['edit']) login.draw()

  return s
}

function keyMappings (e) {
  if (e.keyCode === 27) { 
    e.preventDefault()
  } else if (e.keyCode === 40 || e.keyCode === 38 && live) {
    e.preventDefault() 
    var incdec = (e.keyCode === 38) ? 'inc' : 'dec'
  }
}
