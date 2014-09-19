var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var D = require('./dombii.js')
var _ = require('underscore')
var cuid = require('cuid')
var fs = require('fs')

var OMNI = fs.readFileSync(__dirname + '/omni.hogan','utf8')
var LOGIN = fs.readFileSync(__dirname + '/login.hogan','utf8')

module.exports = function Omni (opts) {
  var id = opts.id

  var s = through.obj(function Write (d, enc, next) {
    if (d.code === 1) { // !AUTH
      next() 
      login.draw()
      return false
    } else if (!d.key) { next(); return false }
  
    var path = d.key.split(':')
    if (path[1] === opts.id) {
      if (path[0] === '@edit') { // AUTH SUCCESS!
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw({hud:'falco'})
      }
    }
    next()
  })

  var login = D({ 
    template: LOGIN,
    parent: document.body,
    events : [['.login','submit',function (e) {
      e.preventDefault(); s.push('+@edit '+e.target[0].value+':'+id)
    }]]
  })

  var omni = D({ 
    id : opts.id,
    template: OMNI,
    parent: document.body,
    events : [
      ['.oz','keyup',oz],
      [window,'contextmenu',grifter]
    ]
  })

  function oz (e) { // api interfac / exec
    e.preventDefault()
    var val = e.target.value
  }

  function grifter (e) { // context drompii dom things
    var blob = drompii(e)
    if (blob) {
      console.log("BLOB")
      console.log(blob)
    }
  }

  if (sessionStorage['edit']) {
    s.push('+@edit '+sessionStorage['edit']+':'+opts.id)
  }

  if (!sessionStorage['edit']) login.draw()

  return s
}
