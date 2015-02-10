var cuid = require('cuid')
var _ = require('underscore')
var through = require('through2')
var D = require('../lib/dombii.js')
var p = require('../lib/paper-core.js')

function IO (d,e,n) {
  n()
}

var s = through.obj(IO)

var patchTemplate = 
  '<ul class="make" style="top:{{y}}px;left:{{x}}px;">'
  + '<li><input autofocus="true" type="text" value=""></input></li>'
  + '{{#autoComplete}}<li>{{name}}</li>{{/autoComplete}}</ul>'

var omniMenu = new D({
  template : patchTemplate,
  events : [['input','keyup', function (e) {
    if (e.keyCode === 13) { 
      s.push('+'+e.target.value+'/xy')
      omniMenu.erase()
    }
    if (e.keyCode === 27) { e.preventDefault(); omniMenu.erase() }
  }]]
})

var sketch = {
  patch : null,
  boxes : {},
  cords : {}
}

var windowCenter = [
  Math.floor(window.innerWidth/2),
  Math.floor(window.innerHeight/2) 
]

module.exports = function (opts) { // opts.lib & opts.settings
  var canvas = document.createElement('canvas')

  document.body.appendChild(canvas)

  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  p.setup(canvas)

  var selection = new p.Path.Rectangle({
    fillColor : 'red',
    point : [100,100],
    size : [20,20],
    opacity : 0.1,
    visible : false
  })

  function select (e) {
    if (p.project.hitTest([e.clientX,e.clientY])) return false

    selection.visible = true
    selection.bringToFront()

    var c0 = [e.clientX, e.clientY] // 1st corner of selection

    window.onmousemove = function (ev) {
      var c3 = [ev.clientX, ev.clientY]
      var c1 = [(c3[0] - c0[0]) + c0[0], c0[1]]
      var c2 = [c0[0], (c3[1] - c0[1]) + c0[1]]

      selection.segments = [c0,c2,c3,c1]

      p.view.draw()

      // for (bx in patch.boxes) {
      //   var b = patch.boxes[bx].obj.children[0]
      //   if (b.position.isInside(selection)) {
      //     b.fillColor = 'rgba(255,0,0,0.3)'
      //     patch.sel.push(patch.boxes[bx])
      //     patch.container.addChild(patch.boxes[bx].obj)
      //   }
      // }
      
      // for (cx in patch.cords) {
      //   var sects = patch.cords[cx].obj.getIntersections(selection)
      //   if (sects.length>0) {
      //     var id = sects[0].curve.path.data
      //     patch.cords[id].obj.strokeColor = 'red'
      //     patch.sel.push(patch.cords[id])
      //   }
      // }
    }
  }

  function mouseRelease (e) { 
    var hit = p.project.hitTest([ e.clientX, e.clientY ])

    if (hit && (hit.item.data === 'in' || hit.item.data === 'out')) {
      console.log(hit.item)
      console.log(hit.item.parent.data)
    } else {
      if (sketch.patch) {
      }
      p.view.draw()
      if (selection.visible) selection.visible = false
      window.onmousemove = null 
    }

    // if (patch.cord) { // good
    //   if (patch.cord.i && patch.cord.o) { // should snap on realease 
    //     var p = patch.boxes[patch.cord.i].obj.children[3].position
    //     patch.cord.drag(false, [p.x, p.y])
    //     patch.boxes[patch.cord.i].ins.push(patch.cord)
    //     patch.boxes[patch.cord.o].outs.push(patch.cord)
    //     patch.cord.obj.data = patch.cord.i + patch.cord.o
    //     patch.cords[patch.cord.i + patch.cord.o] = patch.cord
    //     drawCord = false
    //   } else patch.cord.del()
    // }
  }

  function keymap (e) {
    if (e.shiftKey && e.keyCode === 78) {
      omniMenu.draw({x:opts.x,y:opts.y})
    }
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 65) {
      if (e.shiftKey) {
        patch.sel.forEach(function (i) {
          if (i instanceof cord) i.obj.strokeColor = 'blue'
          else i.obj.children[0].fillColor = 'rgba(0,0,255,0.2)'
        })
        patch.sel = []
        p.view.draw()
        return
      }
      for (b in patch.boxes) {
        patch.boxes[b].obj.children[0].fillColor = 'rgba(255,0,0,0.3)'
        patch.sel.push(patch.boxes[b])
      }
      for (c in patch.cords) {
        patch.cords[c].obj.strokeColor = 'red'
        patch.sel.push(patch.cords[c])
      }
      p.view.draw()
    }
  }

  function makeModule (e) {
    opts.x = e.clientX
    opts.y = e.clientY
    // inputNew.style.top = (e.clientY - 11)
    // inputNew.style.left = (e.clientX - 50)
    // inputNew.style.display = 'block'
    // inputNew.focus()
  }

  canvas.addEventListener('dblclick', makeModule, false)
  canvas.addEventListener('mousedown', select, false)
  window.addEventListener('keydown', keymap, false)
  window.addEventListener('mouseup', mouseRelease, false)

  return s
}

function drawPatchLIne (e) {
  sketch.patch = cuid()

  var pos = e.target.position

  sketch.cords[sketch.patch] = new p.Path.Line({
    strokeColor : 'blue',
    from : pos, 
    data : sketc.patch,
    to : pos
  })

  window.onmousemove = function (e) {
    data.cord[drawCord].segments = [
      pos,
      [e.clientX - 4, e.clientY - 4]
    ]
    p.view.draw()
  }
}

function dragBox (e) {
  var cid = e.target.parent.data
  if (!cid || e.target.data === 'o' || e.target.data === 'i') return

  var t = e.target.parent
  var oX = (e.point.x - t.position.x) 
  var oY = (e.point.y - t.position.y)

  window.onmousemove = function (ev) {
    t.position = [ev.clientX - oX, ev.clientY - oY]
  }
}

function makeBox (pos, name, id) {
  var txt = new p.PointText({
    content : name.toUpperCase(),
    fillColor : 'blue',
    fontSize : 11,
    fontFamily : 'Input Sans Condensed',
    point : pos
  })

  var bg = new p.Path.Rectangle({
    size : [txt.bounds.width+11,18],
    point : pos,
    fillColor : 'rgba(0,0,255,0.2)'
  })

  bg.position = txt.position

  var output = new p.Path.RoundRectangle({
    center : [(bg.position.x+(bg.bounds.width/2))-5, bg.position.y+11],
    size : [10,6],
    fillColor : 'blue',
    strokeWidth : 0,
    data : 'o'
  })

  output.onMouseEnter = function (e) { 
    hov.position = e.target.position
    hov.visible = true
  }

  output.onMouseLeave = function (e) { hov.visible = false }
  output.onClick = drawPatchLIne

  var input = new p.Path.Rectangle({
    center : [(bg.position.x-(bg.bounds.width/2))+5,bg.position.y-11],
    size : [10,6],
    fillColor : 'blue',
    strokeWidth : 0,
    data : 'i'
  })

  input.onMouseEnter = function (e) {
    hov.position = e.target.position
    hov.visible = true
  }

  input.onMouseLeave = function (e) { 
    hov.visible = false
  }

  var hov = new p.Path.Circle({
    fillColor : 'red',
    center : [(bg.position.x+(bg.bounds.width/2))-4,bg.position.y+9],
    radius : 12,
    visible : false,
    opacity : 0.3
  })

  var box = new p.Group([bg,txt,hov,input,output])
  box.position = new p.Point(pos)
  box.onMouseDown = dragBox
  box.data = id

  return box
}
