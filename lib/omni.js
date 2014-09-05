var asyncMap = require('slide').asyncMap
var through = require('through2')
var _ = require('underscore')
var D = require('browser')
var fs = require('fs')
var rstache = require('reverse-mustache')

var template = fs.readFileSync(__dirname+'/omni.hogan','utf8')

var data = {}
var cache = {}

function input (d) {
  if (d.key.split(':')[1] !== id) { 
  }
}

function dax (el) {
  var element = el
  while (element.parentElement) {
    if (element.id && isCuid(element.id)) return element.id
    element = element.parentElement
  }
  return null
}

function climbToCuid (target) {
  var element = target
  var res = {depth:0}
  while (element.previousSibling || element.parentElement) {
    if (element.id && isCuid(element.id)) { 
      res.top = element
      break 
    }
    if (element.previousSibling && element.previousSibling.tagName) {
      element = element.previousSibling
      res.depth++
    } else if (element.parentElement) {
      element = element.parentElement
      res.depth++
    }
  }
  return res
}
// use reverse stache
// what if the key is buried inside an array
// compare the template with the dom structure -- reverse mustache
  
//   var res = {}
//   var element = el
//   if (el.className.slice(0,2) !== '__') return false
//   res.key = el.className.slice(2)
//   res.value = (el.tagName === 'IMG') ? el.src : el.innerHTML
// 
//   while (element.parentElement) {
//     if (element.id && isCuid(element.id)) { res.parent = element.id; break }
//     element = element.parentElement
//   }
// 
//   return res
// }

function drompii (daxed) { // bind to context click or click
  var prop = (_.keys(data)[daxed.key]) ? daxed.key : null // how to retreive?

  rstache({
    template: template,
    content: 
  })

  // return [prop,data]
  // verify + act
  // take class & grab key
  // get db data + replace
      
  var element = e.target
  while (element.parentElement) {
    if (element.id && isCuid(element.id)) { break }
    element = element.parentElement
  }
  return data
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

  return s
}
