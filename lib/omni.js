var D = require('./dombii.js')
var asyncMap = require('slide').asyncMap
var through = require('through2')
var _ = require('underscore')
var path = require('path')
var fs = require('fs')

var LOGIN = fs.readFileSync(__dirname + '/login.hogan', 'utf8') 
var ERROR = fs.readFileSync(__dirname + '/error.hogan', 'utf8') 
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')

module.exports = function Omni (opts) {
  var frameList = null
  var frame = null
  var blob = null
  var svg = null
  var scale = 0.45

  var s = through.obj(IO)

  // INIT DATA FOR OMNI UI
  if (!localStorage[opts.id]) {
    var dx = {x:10,y:10}
    localStorage[opts.id] = JSON.stringify({data:dx})
  } else {
    var dx = JSON.parse(localStorage[opts.id]).data
  }

  delete opts.lib.env

  dx.lib = _.values(opts.lib)
  dx.cvs = (window.location.pathname === '/@' || window.location.pathname === '/')
    ? 'untitled'
    : window.location.pathname.replace('/','')

  // TEMPLATES
  var err = new D({
    template : ERROR,
    parent : document.body,
    events : [
      ['span','click',function (e){e.preventDefault();err.erase()}]
    ]
  })

  var login = new D({ 
    id : opts.id,
    drag : true,
    template : LOGIN,
    parent : document.body,
    events : [['.login', 'submit', function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+'/'+opts.id)
      e.target[0].value = ''
    }]]
  })
  
  var omni = new D({ 
    drag : true,
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      ['.canvasName','keyup',editCanvasName],
      ['.blackbox input','keyup',blackbox],
      ['.exit','click',function(e){cancel(e);s.push('-@edit/'+opts.id)}],
      ['.lib li','dragstart',dragModule]
    ]
  })

  // symbols ◼ ψ

  // drop modules
  document.addEventListener('dragover', cancel, false)
  document.addEventListener('drop', function (e) {// will this effect upload drops?
    cancel(e)
    cmd = e.dataTransfer.getData('cmd')
    if (cmd) s.push(cmd+'/'+opts.id)
    else return false
  })
  function dragModule (e) {
    cmd = '+'+e.target.innerHTML.split('</b>')[1]
    e.dataTransfer.setData('cmd',cmd)
  }

  // LOGIN
  if (sessionStorage['edit']) 
    s.push('+@edit '+sessionStorage['edit']+'/'+opts.id)

  // global hotkey
  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 13 && e.ctrlKey) 
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        if (!document.querySelector('.login')&&!document.querySelector('.omni')) {
          login.draw(JSON.parse(localStorage[opts.id]).data)
          document.querySelector('.login input').focus()
        } else login.erase()
      }
  })

  // EVENTS
  function IO (d, enc, next) { 
    if (d.code === 1) { // ERROR
      next() 
      if (!login.data) login.draw(JSON.parse(localStorage[opts.id]).data)
      err.draw({x:login.data.x+8,y:login.data.y+36,msg:d.message})
      _.delay(err.erase,2200)
      return null
    } else if (!d.key) { next(); return null }

    var tkn = (d.key.split(':').length > 1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { 
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx)
        var grifter = require('./grifter.js')()
          .on('data', function (d) {
            console.log(d)
          })
      } else {
        if (d.value === '-edit') {
          omni.erase() 
          document.body.setAttribute('class', null)
        } else { 
          if (_.keys(d.value) !== frameList) {
            editCanvasName()
            frameList = _.keys(d.value)
          } else frameList = _.keys(d.value)
        }
      }
    }

    next()
  }
  
  function blackbox (e) {
    var val = e.target.value.replace(' ','')
    if (e.keyCode === 13 || e.key === 'Enter') {
      e.preventDefault()
      e.target.value = ''
      s.push(val+'/'+opts.id)
    } 
  } 

  function editCanvasName (e) { 
    var c
    if (e && e.keyCode === 13) {
      ps(e.target.value)
      e.target.blur()
      c = '+#'+window.location.pathname.replace('/','')
    } else if (!e) c = '+#'+window.location.pathname.replace('/','')
    if (c) s.push(c)
  }

  return s
}

// HELPERS
function ps (link) {
  if (!link) return window.location.pathname.replace('/','')
  history.pushState({'cmd':'!#'+link},'',link)
}
function cancel (e) { 
  e.preventDefault() 
}
