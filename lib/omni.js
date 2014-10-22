var pj = require('./paper-core.js')
var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var D = require('./dombii.js')
var ddx = require('./dedex.js')
var fs = require('fs')
var _ = require('underscore')


var OMNI = fs.readFileSync(__dirname+'/omni.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname+'/grifter.hogan', 'utf8')
var LOGIN = fs.readFileSync(__dirname+'/login.hogan', 'utf8')


module.exports = function Omni (opts) {
  console.log(opts.id)
  var blob 
  var dx = {x:20, y:20}


  // INTERFACE
  
  var s = through.obj(function Write (d, enc, next) {

    if (d.code === 1) { 

      next() 
      login.draw({err:true,msg:d.message})
      return null

    } else if (!d.key) { next(); return null }

    var tkn = (d.key.split(':').length>1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { // AUTH'd!
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, initUI)
      } else { 
        // var val = d.value[0]
        // if (!val) { next(); return false }
        // dx.pkg = val
        // ui.readout(val.name)
        // pj.view.draw()
      }
    }
    next()
  })


  // UI
  
  var ui =  {}

  function initUI () {
    pj.setup(document.querySelector('#cvs'))

    ui.results = new pj.Group({ point:[0,0] })

    ui.label = new pj.PointText({
      point : [0,0],
      fontFamily : 'Monaco',
      fillColor : 'black',
      content : name,
      fontSize : 10
    })
 
    ui.makeBox = function (name,pos) {
      var label = new pj.PointText({
        point : [0,0],
        fontFamily : 'Monaco',
        fillColor : 'black',
        content : name,
        fontSize : 10
      })
      label.position.x = (label.bounds.width/2)+4
      label.position.y = (label.bounds.height/2)+4

      var frame = new pj.Shape.Rectangle({
        strokeWidth : 1,
        strokeColor : 'black',
        point : [0,0],
        size : [label.bounds.width+8, label.bounds.height+8]
      })

      var nb = new pj.Group({
        children : [frame,label]
      })
      nb.position.x = label.position.x + 2

      var y = (ui.results.children.length+1)*(frame.bounds.height+4)
      y += (label.position.y+1)

      nb.position.y = y
      
      return nb 
    }

    ui.readout = function (str) {
      ui.label.content = str
      ui.label.position.y = (ui.label.bounds.height/2) + 4
      ui.label.position.x = ui.label.bounds.width/2
    }
  }


  // TEMPLATES
  
  login = new D({ 
    template : LOGIN,
    parent : document.body,
    events : [['.login','submit',function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+':'+opts.id)
      e.target[0].value = ''
    }]]
  })
  omni = new D({ 
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      [window,'contextmenu',grifter],
      ['.oz','keyup',keyInput],
      ['h1','mousedown',grip],
      ['h1','mouseup',ungrip]
    ]
  })
  editor = new D({
    template : GRIFTER,
    parent : document.body,
    events : [
      ['.grifter','keyup',edit],
      ['.grifter','drop',upload],
      ['.grifter','dragenter',cancel],
      ['.grifter','dragleave',cancel],
      ['.grifter','dragover',cancel]
    ]
  })


  // EVENTS

  function keyInput (e) {
    var val = e.target.value.replace(' ','')

    if (e.keyCode === 8 || e.key === 'Backspace' && val === '')
      pj.view.draw()

    else if (e.keyCode === 13 || e.key === 'Enter') {
      e.preventDefault()
      // var b = ui.makeBox(dx.pkg.name,[0,10])
      // ui.results.addChild(b)
      // pj.view.draw()
      // e.target.value = ''
      s.push(val+':'+opts.id) 
    } 
  }


  // MAKE PANELS DRAGGABLE

  var drag
  function ungrip (e) { window.removeEventListener('mousemove',drag) }
  function grip(e) {
    e.preventDefault()
    ungrip(e)
    var p = e.target.parentElement
    var offX = e.clientX - p.offsetLeft
    var offY = e.clientY - p.offsetTop

    drag = function (e) {
      dx.x = e.clientX - offX
      dx.y = e.clientY - offY
      omni.draw(dx)
    }

    window.addEventListener('mousemove',drag,false) 
  }


  // CONTEXT / EDIT
  
  function grifter (e) {
    e.preventDefault()
    blob = drompii(e)
    editor.erase()
    var x = e.clientLeft
    var y = e.clientTop
    editor.draw({x:0,y:0,body:_.values(blob.edit)[0]})
  }

  function edit (e) { 
    if (e.keyCode === 13) {
      e.preventDefault()
      blob.data[_.keys(blob.data)[0]] = e.target.value
      s.push({key:'+$'+blob.id,value:blob.data})
      editor.erase()
    }
  }

  function upload (e) {
    cancel(e)
    var files = e.dataTransfer.files
    for (file in files) {
      if (file === 'length') return

      var fileName = files[file].name

      var formData = new FormData()
      formData.append('file', fileName)
      formData.append('token', 'test123')

      var xhr = new XMLHttpRequest()
      xhr.open('post', '/upload', true) 
      xhr.addEventListener('error', function (e) { console.error(e) }, false) 
      xhr.addEventListener('progress', function (e) { 
        console.log(e)
      }, false) 

      var reader = new FileReader()
      reader.readAsDataURL(files[file])
      reader.addEventListener('load', function (data) {
        formData.append('blob', data.target.result)
        xhr.send(formData)
      }, false)
    }
  }

  if (sessionStorage['edit']) 
    s.push('+@edit '+sessionStorage['edit']+':'+opts.id)

  if (!sessionStorage['edit']) login.draw({err:false})

  return s
}

function cancel (e) { 
  e.preventDefault() 
  if (e.stopPropogation) e.stopPropogation() 
}
