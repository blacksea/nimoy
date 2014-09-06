var asyncMap = require('slide').asyncMap
var through = require('through2')
var _ = require('underscore')
var D = require('./dombii.js')
var fs = require('fs')

var template = fs.readFileSync(__dirname+'/omni.hogan','utf8')

// MANIPULATE THE DOM!!!

module.exports = function Omni (opts) {
  var id = opts.id

  var s = through.obj(function Write (d, enc, next) {
    if (d.to && d.to === id) {
      if (d.key === 'canvas:library') {
        library.canvas = JSON.parse(d.value)
      } else grifter.data(d.value)
    }
    next()
  })

  function drompii (e) {
    var target = climbToCuid(e.target)
    var parcel = JSON.parse(localStorage[target.top.id])
    s.push(parcel[target.depth])
  }

  window.addEventListener('contextmenu', drompii, false)

  return s
}

function climbToCuid (target) {
  var element = target
  var depth = 0
  while (element) {
    if (element.previousSibling) {
      element = element.previousSibling; depth++
    } else if (element.parentElement) {
      element = element.parentElement; depth++
    }
    if (element.id && isCuid(element.id)) {
      return {depth:depth,top:element} 
    }
  }
}

function keyMappings (e) {
  if (e.keyCode === 27) { 
    e.preventDefault()
    om.toggle() 
  } else if (e.keyCode === 40||e.keyCode === 38&&live) {
    e.preventDefault() 
    var incdec = (e.keyCode === 38) ? 'inc' : 'dec'
    om.sel(incdec) 
  }
}

// need upload helper!
function isCuid (id) {
  var r = (typeof id==='string' && id.length===25 && id[0]==='c') 
    ? true 
    : false

  return r
}
