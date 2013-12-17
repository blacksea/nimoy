// UI ELEMENTS with PAPERJS

var through = require('through')
var cvs

window.addEventListener('resize', sizeCanvas, false)
function sizeCanvas (e) {
  cvs.height = window.innerHeight
  cvs.width = window.innerWidth
}

function fade (mode, item, cb) {
  var i = 0
  paper.view.onFrame = function (e) {
    var dec = i*0.06
    if (dec <= 1) {
      if (mode == 'out') item.opacity = 1-dec
      if (mode == 'in') item.opacity = dec
      paper.view.draw()
    } 
    if (i == 16) cb()
    i++
  }
}

module.exports = function (loaded) {
  cvs = document.createElement('canvas')
  document.body.appendChild(cvs)
  sizeCanvas()
  var paperJS = document.createElement('script')
  paperJS.setAttribute('src','/paper-core.min.js')
  paperJS.setAttribute('type','text/javascript')
  document.body.appendChild(paperJS)
  paperJS.addEventListener('load', function () {
    paper.setup(cvs)
    loaded()
  }, false)
  return module.exports
}

module.exports.notify = function (opts) {
  var count = 0
  var s = through(function write (d) {
    count++
    if (d.mood == 0) var color = 'blue'
    if (d.mood == 1) var color = 'red'
    var text = new paper.PointText({point:[50,((30/2)+(24/3))+25]})
    text.content = d.c
    text.fillColor = color
    text.fontSize = 24
    text.font = 'monospace'
    text.fontWeight = 'bold'
    var bg = new paper.Path.Rectangle({radius:5,from:[0,25],to:[text.bounds.width+60,55]})
    bg.strokeColor = color
    bg.fillColor = 'white'
    bg.strokeWidth = 2
    var msg = new paper.Group({children:[bg,text]})
    msg.position.x = paper.view.center.x
    if (count>1) msg.position.y = count*38
    fade('in',msg,function () {
      setTimeout(function () {
        fade('out',msg,function () {
          count--
          msg.remove()
        })
      }, opts.length)
    })
  }, function end() {
    this.end()
  }, {autoDestroy:false})
  return s
}

