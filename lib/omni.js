var pj = require('./paper-core.js')
var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var D = require('./dombii.js')
var ddx = require('./dedex.js')
var fs = require('fs')
var _ = require('underscore')
var path = require('path')


var OMNI = fs.readFileSync(__dirname+'/omni.hogan', 'utf8')
var GRIFTER = fs.readFileSync(__dirname+'/grifter.hogan', 'utf8')
var LOGIN = fs.readFileSync(__dirname+'/login.hogan', 'utf8') 


module.exports = function Omni (opts) {
  var blob 
  var dx = {}
  dx.desc = 'login'

  var s = through.obj(function Interface (d, enc, next) {
    if (d.code === 1) { 
      next() 
      login.draw({err:true,msg:d.message})
      document.body.querySelector('#login').focus()
      return null
    } else if (!d.key) { next(); return null }

    var tkn = (d.key.split(':').length>1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { 
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, initUI)
      } else { 
        if (d.value === '-edit') omni.erase() // but it should also be unpiped

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

      label.position.x = (label.bounds.width/2) + 4
      label.position.y = (label.bounds.height/2) + 4

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
  
  var login = new D({ 
    template : LOGIN,
    parent : document.body,
    events : [['.login','submit',function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+':'+opts.id)
      e.target[0].value = ''
    }]]
  })

  var omni = new D({ 
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      [window,'contextmenu',grifter],
      ['.oz','keyup',keyInput]
    ]
  })

  var editor = new D({
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
      s.push(val)
    } 
  }


  // MAKE PANELS DRAGGABLE

  var drag
  function ungrip (e) { window.removeEventListener('mousemove',drag) }
  function grip(e) {
    e.preventDefault()

    ungrip(e)

    var p = e.target.parentElement
    var offX = e.clientX - p.pageX
    var offY = e.clientY - p.pageY

    drag = function (e) {
      dx.x = e.clientX - offX
      dx.y = e.clientY - offY
      omni.draw(dx)
    }

    window.addEventListener('mousemove', drag, false) 
  }


  // CONTEXT / EDIT
  
  function grifter (e) {
    e.preventDefault()
    blob = drompii(e)
    editor.erase()

    var dx = {
      x : e.pageX-10,
      y: e.pageY-10,
      body: _.values(blob.edit)[0].replace(/[\n\r]/g,'')
    }

    if (dx.body.length>140) { dx.w = 400; dx.h = 300 }

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


  function upload (e) {
    cancel(e)
    var files = e.dataTransfer.files

    for (file in files) {
      if (file === 'length') return
      if (files[file] && files[file].type) 
        var fileName =files[file].name.replace(/[^a-z0-9]/gi,'_').toLowerCase()

      var filepath
      var ndata = {}
      var formData = new FormData()
      formData.append('file', fileName)
      formData.append('token', 'test123') 

      var xhr = new XMLHttpRequest()
      xhr.addEventListener('error', function (e) { console.error(e) }, false) 
      xhr.addEventListener('load', function (e) {
        s.push({key:'+$'+ndata.id,value:ndata.data})
      }, false) 
      xhr.addEventListener('progress', function (e) { 
        editor.data.body = 'loaded : ' + (e.loaded/e.total) * 100 + '% '
        editor.draw()
        if (e.loaded === e.total) editor.erase()
        else if (e.total === 0) editor.erase()
      }, false) 
      xhr.open('post', '/upload', true) 

      var reader = new FileReader()
      reader.readAsDataURL(files[file])
      reader.addEventListener('load', function (data) {
        filePath = '/files/'+fileName
        formData.append('blob', data.target.result)
        editor.erase()
        if (data.target.result.split('/')[0]==='data:image') {
          var img = new Image()
          img.src = data.target.result
          img.addEventListener('load',function (e) {
            blob.edit.w = e.target.width
            blob.edit.h = e.target.height
            blob.edit.src = '/files/'+fileName
            _.each(blob.edit, function (v,k,l) {
              if (blob.data[k]) blob.data[k] = v
            })
            _.each(blob, function (v,k,l) { ndata[k] = v })
          },false)
        }
        xhr.send(formData)
      }, false)
    }
  }

  if (sessionStorage['edit']) 
    s.push('+@edit '+sessionStorage['edit']+':'+opts.id)

  if (!sessionStorage['edit']) {
    login.draw({err:false})
    document.body.querySelector('#login').focus()
  }

  return s
}

function cancel (e) { 
  e.preventDefault() 
  if (e.stopPropogation) e.stopPropogation() 
}
