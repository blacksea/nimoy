var d3 = require('d3')
var D = require('./dombii.js')
var pj = require('./paper-core.js')
var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var ddx = require('./dedex.js')
var _ = require('underscore')
var path = require('path')
var fs = require('fs')

var GRIFTER = fs.readFileSync(__dirname + '/grifter.hogan', 'utf8')
var LOGIN = fs.readFileSync(__dirname + '/login.hogan', 'utf8') 
var OMNI = fs.readFileSync(__dirname + '/omni.hogan', 'utf8')

module.exports = function Omni (opts) {
  var blob = null
  var frame = null
  var frameList = null
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
      [window,'contextmenu',grifter],
      ['.canvasName','keyup',editCanvasName],
      ['.blackbox input','keyup',blackbox],
      ['.exit','click',function(e){cancel(e);s.push('-@edit/'+opts.id)}],
      ['.lib li','dragstart',dragModule]
    ]
  })

  var editor = new D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter','keyup',edit],
      ['.grifter','dragenter',cancel],
      ['.grifter','dragleave',cancel],
      ['.grifter','dragover',cancel]
    ]
  })

  document.addEventListener('keydown', function toggleLogin (e) { 
    // need a check to see that login is active
  })
  document.addEventListener('dragover', cancel, false)
  document.addEventListener('drop', function (e) {
    cancel(e)
    cmd = e.dataTransfer.getData('cmd')
    if (cmd) s.push(cmd+'/'+opts.id)
    else return false
  })
  function dragModule (e) {
    cmd = '+'+e.target.querySelector('span').innerHTML
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
    if (d.code === 1) { 
      next() 
      login.draw({x:dx.x,y:dx.y,err : true, msg : d.message})
      return null
    } else if (!d.key) { 
      next() 
      return null 
    }

    var tkn = (d.key.split(':').length > 1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { 
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx)
        document.body.setAttribute('class','editing')
      } else {
        if (d.value === '-edit') {
          omni.erase() 
          document.body.setAttribute('class', null)
        } else { 
          if (_.keys(d.value) !== frameList) {
            save()
            frameList = _.keys(d.value)
          } else frameList = _.keys(d.value)
        }
      }
    }

    next()
  }

  function grifter (e) {
    e.preventDefault()
   
    if (e.target.parentNode.class === 'lib') { // modify these menus -- load
      return false
    } 

    blob = drompii(e)

    editor.erase()

    var dx = {
      x : e.pageX-10,
      y : e.pageY-10,
      body : _.values(blob.edit)[0].replace(/[\n\r]/g,'')
    }

    if (dx.body.length > 140) { dx.w = 400; dx.h = 300 }

    switch (blob.type) {
      case 'SPAN' : editor.draw(dx);break;
      case 'IMG' : editor.draw(dx);break;
    }
  }

  function edit (e) { 
    if (e.keyCode === 13) {
      e.preventDefault()
      var body = e.target.value.replace(/[\n\r]/g,'')
      blob.data[_.keys(blob.edit)[0]] = body
      s.push({key:'+$'+blob.id,value:blob.data})
      editor.erase()
      return false
    }
  }

  function toggleCanvas (e) {
    dx.w = window.innerWidth
    dx.h = window.innerHeight
    e.preventDefault()
    if (dx.bones !== 'block') {
      dx.bones = 'block'
      omni.draw(dx)
      // if (frame) _.defer(function(){drawBones(frame)})
    } else {
      dx.bones = null
      omni.draw(dx)
    }
  }

  function toggleLib (e) {
    cancel(e)
    if (dx.showlib) {
      dx.showlib = false
      e.target.style.background = 'transparent'
    } else {
      dx.showlib = true
      e.target.style.background = '#FAFAFA'
    }
    omni.draw(dx)
  }
  
  function blackbox (e) {
    var val = e.target.value.replace(' ','')
    if (e.keyCode === 13 || e.key === 'Enter') {
      e.preventDefault()
      e.target.value = ''
      s.push(val+'/'+opts.id)
    } 
  } 
  /////////////////////////////////////////////////////////////////////////////

  function editCanvasName (e) { 
    var c
    if (e && e.keyCode === 13) {
      ps(e.target.value)
      e.target.blur()
      c = '+#'+window.location.pathname.replace('/','')
    } else if (!e) c = '+#'+window.location.pathname.replace('/','')
    if (c) {
      console.log(c)
      s.push(c)
    }
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
