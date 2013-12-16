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


