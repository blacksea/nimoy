var pj = require('./paper-core.js')
var asyncMap = require('slide').asyncMap
var drompii = require('./drompii.js')
var through = require('through2')
var D = require('./dombii.js')
var ddx = require('./dedex.js')
var cuid = require('cuid')
var fs = require('fs')

var OMNI = fs.readFileSync(__dirname + '/omni.hogan','utf8')
var LOGIN = fs.readFileSync(__dirname + '/login.hogan','utf8')

module.exports = function Omni (opts) {
  var dx = {x:20, y:20}


  // IN/OUT
  
  var s = through.obj(function Write (d, enc, next) {
    if (d.code === 1) { 
      next() 
      login.draw({err:true,msg:d.message})
      return false
    } else if (!d.key) { 
      next() 
      return false 
    }

    var tkn = (d.key.split(':').length>1) 
      ? d.key.split(':')[1]
      : d.key
  
    if (tkn && tkn === opts.id) {
      if (d.key.split(':')[0] === '@edit') { // AUTH SUCCESS!
        sessionStorage['edit'] = d.value
        login.erase()
        omni.draw(dx, initUI)
      } else { // brico responses
        var val = d.value[0]
        if (!val) { next(); return false}
        dx.pkg = val
        ui.readout(val.name)
        pj.view.draw()
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

      console.log(nb.bounds.width)

      return nb
    }

    ui.readout = function (str) {
      ui.label.content = str
      ui.label.position.y = (ui.label.bounds.height/2) + 4
      ui.label.position.x = ui.label.bounds.width/2
    }
  }


  // TEMPLATES
  
  var login = D({ 
    template : LOGIN,
    parent : document.body,
    events : [['.login','submit',function (e) {
      e.preventDefault() 
      s.push('+@edit '+e.target[0].value+':'+opts.id)
      e.target[0].value = ''
    }]]
  })

  var omni = D({ 
    id : opts.id,
    template : OMNI,
    parent : document.body,
    events : [
      ['.oz','keyup',keyInput],
      ['h1','mousedown',grip],
      ['h1','mouseup',ungrip],
      [window,'contextmenu',grifter]
    ]
  })


  function print (str) { // show errs & etc...

  }

  function addObj (pkg) {
    
  }

  function keyInput (e) {
    var val = e.target.value
    ui.label.content = ''
    pj.view.draw()

    // delete
    if (e.keyCode === 8 || e.key === 'Backspace' && val === '')
      pj.view.draw()

    else if (e.keyCode === 13 || e.key === 'Enter') { // select
      e.preventDefault()
      var b = ui.makeBox(dx.pkg.name,[0,10])
      ui.results.addChild(b)
      pj.view.draw()
      e.target.value = ''
    } 

    // exec
    else if (val !== '') s.push(e.target.value+':'+opts.id) 
  }


  // MAKE PANEL DRAGGABLE

  var drag
  function ungrip (e) { window.removeEventListener('mousemove',drag) }
  function grip(e) {
    e.preventDefault()
    window.removeEventListener('mousemove',drag,false) 
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


  // CONTEXT / INSPECT
  
  function grifter (e) {
    e.preventDefault()
    var blob = drompii(e) // mod this!
  }


  if (sessionStorage['edit'])
    s.push('+@edit '+sessionStorage['edit']+':'+opts.id)

  if (!sessionStorage['edit']) login.draw({err:false})

  return s
}
