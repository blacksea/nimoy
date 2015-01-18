var cuid = require('cuid')
var through = require('through2')
var p = require('../lib/paper-core.js')

module.exports = function (cvs) {
  var dblClick = {x:0,y:0} 
  var canvas = document.body.querySelector(cvs)
  p.setup(canvas)
  var s = through.obj()
  var inputNew = document.createElement('input')
  document.body.appendChild(inputNew)

  var selection = new p.Path.Rectangle({
    fillColor : 'red',
    point: [0,0],
    size: [0,0],
    opacity : 0.1,
    visible : false
  })

  // CONNECT / PIPE
  window.onmouseup = function (e) { 
    if (patch.cord) { // good
      if (patch.cord.i && patch.cord.o) { // should snap on realease 
        var p = patch.boxes[patch.cord.i].obj.children[3].position
        patch.cord.drag(false, [p.x, p.y])
        patch.boxes[patch.cord.i].ins.push(patch.cord)
        patch.boxes[patch.cord.o].outs.push(patch.cord)
        patch.cord.obj.data = patch.cord.i+patch.cord.o
        patch.cords[patch.cord.i+patch.cord.o] = patch.cord
        patch.cord = false
      } else patch.cord.del()
    }
    window.onmousemove = null 
  }

  // A WAY TO RM MODULES / PIPES

  // PLACE / ADD
  canvas.addEventListener('dblclick', function (e) {
    inputNew.style.top = (e.clientY - 10)
    inputNew.style.left = (e.clientX - 50)
    inputNew.style.display = 'block'
    inputNew.focus()
    dblClick.x = e.clientX
    dblClick.y = e.clientY
  },false)

  canvas.addEventListener('mousedown', function (e) {
    if (patch.cord) return false
    selection.visible = true
    selection.bringToFront()
    var c0 = [e.clientX,e.clientY]
  
    window.onmousemove = function (ev) {
      var c3 = [ev.clientX,ev.clientY]
      var c1 = [(c3[0]-c0[0])+c0[0],c0[1]]
      var c2 = [c0[0],(c3[1]-c0[1])+c0[1]]
      selection.segments = [c0,c2,c3,c1]
      for (bx in patch.boxes) {
        var b = patch.boxes[bx].obj.children[0]
        if (b.position.isInside(selection)) b.fillColor = 'rgba(255,0,0,0.1)'
        // if (selection.intersect(b)) console.log('BLAM')
      }
      for (cx in patch.cords) {
        var sects = patch.cords[cx].obj.getIntersections(selection)
        if (sects.length>0) {
          var id = sects[0].curve.path.data
          patch.cords[id].obj.strokeColor ='red'
        }
      }
      p.view.draw()
    }
  },false)

  canvas.addEventListener('mouseup', function (e) {
    selection.visible = false
    window.onmousemove = null
  },false)

  inputNew.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) { 
      // get library reference for module
      // get --> assign cuid!
      // use input stream to draw
      patch.boxes[e.target.value] = 
        new box([dblClick.x, dblClick.y], e.target.value)
      // use brico api to make patch
      inputNew.style.display = 'none'
      inputNew.value = ''
      p.view.draw()
    }
  })

  return s
}

var patch = {
  cord : false,
  boxes : {},
  cords : {}
}

var cord = function (pos) {
  var c = new p.Path.Line({
    strokeColor : 'black',
    from : pos, 
    to : pos
  })
  this.drag = function (x,y) {
    if (!x) x = c.segments[0]
    if (!y) y = c.segments[1]
    c.segments = [x,y]
  }
  this.del = function () { c.remove() }
  this.i = false
  this.o = false
  this.obj = c
}

var box = function (pos, name) {
  var self = this
  this.ins = []
  this.outs = []
  var txt = new p.PointText({
    content : name.toUpperCase(),
    fillColor : 'black',
    fontSize : 12,
    fontFamily : 'Input Sans Condensed',
    point : pos
  })
  var bg = new p.Path.Rectangle({
    size : [txt.bounds.width+12,18],
    point : pos,
    strokeColor : 'black',
    strokeWidth : 1,
    fillColor : '#fffff5'
  })
  bg.position = txt.position
  var output = new p.Path.RoundRectangle({
    center : [(bg.position.x+(bg.bounds.width/2))-4,bg.position.y+9],
    size : [10,6],
    fillColor : 'black',
    strokeWidth : 0,
    data : name
  })
  var input = new p.Path.Rectangle({
    center : [(bg.position.x-(bg.bounds.width/2))+4,bg.position.y-9],
    size : [10,6],
    fillColor : 'black',
    strokeWidth : 0,
    data : name
  })
  var hov = new p.Path.Circle({
    fillColor : 'red',
    center : [(bg.position.x+(bg.bounds.width/2))-4,bg.position.y+9],
    radius : 12,
    visible : false,
    opacity : 0.3
  })
  output.onMouseEnter = function (e) { 
    hov.position = e.target.position
    hov.visible = true
  }
  output.onMouseLeave = function (e) { hov.visible = false }
  output.onMouseDown = function (e) {
    patch.cord = new cord(e.target.position)
    window.onmousemove = function (ev) {
      patch.cord.drag(false,[ev.clientX-2, ev.clientY-2])
      patch.cord.o = e.target.data
      p.view.draw()
    }
  }
  input.onMouseEnter = function (e) { 
    hov.position = e.target.position
    hov.visible = true
    if (patch.cord) patch.cord.i = e.target.data
  }
  input.onMouseLeave = function (e) { 
    hov.visible = false
    if (patch.cord) patch.cord.i = null
  }
  var b = new p.Group([bg,txt,hov,input,output])
  this.obj = b
  b.position = new p.Point(pos)
  b.onMouseDown = function (e) {
    if (typeof e.target.data === 'string') return
    var t = e.target.parent
    var oX = (e.point.x - t.position.x) 
    var oY = (e.point.y - t.position.y)
    window.onmousemove = function (ev) {
      t.position = [ev.clientX - oX, ev.clientY - oY]
      self.ins.forEach(function (c) {
        var p = b.children[3].position
        c.drag(false,[p.x,p.y])
      })
      self.outs.forEach(function (c) {
        var p = b.children[4].position
        c.drag([p.x,p.y],false)
      })
    }
  }
}
